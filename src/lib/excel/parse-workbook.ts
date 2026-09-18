import { strFromU8, unzipSync } from "fflate";
import { DATE_COLUMNS, EXCEL_COLUMNS, COLUMN_TO_FIELD } from "./types";
import type { ExcelRow, LedgerRecord } from "./types";
import { normalizeText, parseDateValue } from "./normalize";

function emptyLedger(): LedgerRecord {
  return {
    employeeId: "",
    name: "",
    birthDate: "",
    gender: "",
    employeeCategory: "",
    orgType: "",
    parentOrg: "",
    department: "",
    jobGroup: "",
    jobGrade: "",
    facultyType: "",
    nonFulltimeType: "",
    employmentType: "",
    firstAppointDate: "",
    currentGradeDate: "",
    contractStart: "",
    contractEnd: "",
    employmentStatus: "",
    leaveStart: "",
    leaveEnd: "",
    retireDate: "",
    asOfDate: "",
  };
}

const NS = "(?:[\\w.-]+:)?";

function decodeXml(text: string) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number(dec)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function innerText(xml: string) {
  return [...xml.matchAll(new RegExp(`<${NS}t\\b[^>]*>([\\s\\S]*?)</${NS}t>`, "g"))]
    .map((match) => decodeXml(match[1] ?? ""))
    .join("");
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match?.[1] ?? "";
}

function columnLettersToNumber(letters: string) {
  let value = 0;
  for (const char of letters) {
    value = value * 26 + (char.charCodeAt(0) - 64);
  }
  return value;
}

function parseCellRef(ref: string) {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    return null;
  }
  return {
    col: columnLettersToNumber(match[1].toUpperCase()),
    row: Number(match[2]),
  };
}

function unzipXlsx(buffer: Buffer) {
  const files = unzipSync(new Uint8Array(buffer));
  const entries = new Map<string, Uint8Array>();
  for (const [name, data] of Object.entries(files)) {
    entries.set(name.replace(/^\/+/, ""), data);
  }
  return entries;
}

function readXml(files: Map<string, Uint8Array>, path: string) {
  const data = files.get(path);
  if (!data) {
    return null;
  }
  return strFromU8(data);
}

function parseRels(xml: string) {
  const rels = new Map<string, string>();
  for (const match of xml.matchAll(
    new RegExp(`<${NS}Relationship\\b([^>]*)\\/?>`, "g"),
  )) {
    const id = attr(match[1] ?? "", "Id");
    const target = attr(match[1] ?? "", "Target");
    if (id && target) {
      rels.set(id, target.replace(/^\/+/, ""));
    }
  }
  return rels;
}

function resolveRelTarget(baseDir: string, target: string) {
  const cleaned = target.replace(/^\/+/, "");
  if (cleaned.startsWith("xl/") || !baseDir) {
    return cleaned;
  }
  const parts = [...baseDir.split("/").filter(Boolean), ...cleaned.split("/")];
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "." || part === "") {
      continue;
    }
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return resolved.join("/");
}

function parseSharedStrings(xml: string | null) {
  if (!xml) {
    return [];
  }
  return [...xml.matchAll(new RegExp(`<${NS}si\\b[^>]*>([\\s\\S]*?)</${NS}si>`, "g"))].map(
    (match) => innerText(match[1] ?? ""),
  );
}

function cellRawValue(
  cellXml: string,
  sharedStrings: string[],
): string | number {
  const openTag = cellXml.match(new RegExp(`^<${NS}c\\b([^>]*)>`))?.[1] ?? "";
  const type = attr(openTag, "t");

  if (type === "inlineStr") {
    const inline =
      cellXml.match(new RegExp(`<${NS}is\\b[^>]*>([\\s\\S]*?)</${NS}is>`))?.[1] ?? "";
    return innerText(inline);
  }

  const valueXml =
    cellXml.match(new RegExp(`<${NS}v\\b[^>]*>([\\s\\S]*?)</${NS}v>`))?.[1] ?? "";
  const value = decodeXml(valueXml.trim());
  if (value === "") {
    return "";
  }

  if (type === "s") {
    const index = Number(value);
    return Number.isInteger(index) ? (sharedStrings[index] ?? "") : "";
  }
  if (type === "b") {
    return value === "1" ? "TRUE" : "FALSE";
  }
  if (type === "str" || type === "e" || type === "inlineStr") {
    return value;
  }

  const numeric = Number(value);
  if (value !== "" && Number.isFinite(numeric)) {
    return numeric;
  }
  return value;
}

function parseSheetRows(sheetXml: string, sharedStrings: string[]) {
  const rows = new Map<number, Map<number, string | number>>();
  const rowRe = new RegExp(`<${NS}row\\b([^>]*)>([\\s\\S]*?)</${NS}row>`, "g");
  const cellRe = new RegExp(
    `<${NS}c\\b([^>]*)/>|<${NS}c\\b([^>]*)>([\\s\\S]*?)</${NS}c>`,
    "g",
  );

  for (const rowMatch of sheetXml.matchAll(rowRe)) {
    const rowAttrs = rowMatch[1] ?? "";
    const rowBody = rowMatch[2] ?? "";
    const rowNumber = Number(attr(rowAttrs, "r"));
    if (!Number.isFinite(rowNumber) || rowNumber < 1) {
      continue;
    }

    const cells = new Map<number, string | number>();
    for (const cellMatch of rowBody.matchAll(cellRe)) {
      const full = cellMatch[0];
      const attrs = cellMatch[1] ?? cellMatch[2] ?? "";
      const ref = attr(attrs, "r");
      const parsedRef = parseCellRef(ref);
      if (!parsedRef) {
        continue;
      }
      cells.set(parsedRef.col, cellRawValue(full, sharedStrings));
    }

    rows.set(rowNumber, cells);
  }

  return rows;
}

function firstWorksheetPath(files: Map<string, Uint8Array>) {
  const fallback = files.has("xl/worksheets/sheet1.xml")
    ? "xl/worksheets/sheet1.xml"
    : null;
  const rootRels = readXml(files, "_rels/.rels");
  const workbookPath = rootRels
    ? [...parseRels(rootRels).values()].find((target) =>
        target.includes("workbook.xml"),
      )
    : "xl/workbook.xml";
  const resolvedWorkbook = workbookPath
    ? resolveRelTarget("", workbookPath)
    : "xl/workbook.xml";
  const workbookXml = readXml(files, resolvedWorkbook);
  if (!workbookXml) {
    return fallback;
  }

  const sheetTag = workbookXml.match(new RegExp(`<${NS}sheet\\b([^>]*)\\/?>`));
  const rId = sheetTag
    ? attr(sheetTag[1] ?? "", "r:id") || attr(sheetTag[1] ?? "", "id")
    : "";
  const workbookDir = resolvedWorkbook.split("/").slice(0, -1).join("/");
  const relsPath = `${workbookDir}/_rels/${resolvedWorkbook.split("/").at(-1)}.rels`;
  const workbookRelsXml = readXml(files, relsPath);
  if (workbookRelsXml && rId) {
    const target = parseRels(workbookRelsXml).get(rId);
    if (target) {
      return resolveRelTarget(workbookDir, target);
    }
  }

  return fallback;
}

export async function parseHrWorkbook(buffer: Buffer) {
  const files = unzipXlsx(buffer);
  const worksheetPath = firstWorksheetPath(files);
  const sheetXml = worksheetPath ? readXml(files, worksheetPath) : null;
  if (!sheetXml) {
    return { ok: false as const, message: "Excel 시트 내용을 읽을 수 없습니다." };
  }

  const sharedStrings = parseSharedStrings(readXml(files, "xl/sharedStrings.xml"));
  const sheetRows = parseSheetRows(sheetXml, sharedStrings);
  const headerRow = sheetRows.get(1);
  if (!headerRow) {
    return { ok: false as const, message: "Excel 시트 내용을 읽을 수 없습니다." };
  }

  const headerByColumn = new Map<number, string>();
  for (const [colNumber, raw] of headerRow.entries()) {
    const header = normalizeText(raw);
    if (header) {
      headerByColumn.set(colNumber, header);
    }
  }

  const headers = [...headerByColumn.values()];
  const missing = EXCEL_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return {
      ok: false as const,
      message: `파일 헤더가 교직원인사원장 형식과 다릅니다. 부족한 열: ${missing.join(", ")}`,
    };
  }

  const columnIndex = new Map<string, number>();
  for (const [colNumber, header] of headerByColumn.entries()) {
    if (!columnIndex.has(header)) {
      columnIndex.set(header, colNumber);
    }
  }

  const rows: ExcelRow[] = [];
  const rowNumbers = [...sheetRows.keys()].filter((rowNumber) => rowNumber > 1).sort((a, b) => a - b);

  for (const rowNumber of rowNumbers) {
    const cells = sheetRows.get(rowNumber);
    if (!cells) {
      continue;
    }

    const record = emptyLedger();
    const dateErrors: string[] = [];

    for (const column of EXCEL_COLUMNS) {
      const colNumber = columnIndex.get(column);
      const raw = colNumber ? (cells.get(colNumber) ?? "") : "";
      const field = COLUMN_TO_FIELD[column];

      if (DATE_COLUMNS.includes(column)) {
        const parsed = parseDateValue(raw);
        if (!parsed.ok) {
          dateErrors.push(column);
          continue;
        }
        if (field !== "employeeId") {
          record[field] = parsed.value;
        }
        continue;
      }

      const text = normalizeText(raw);
      if (field === "employeeId") {
        record.employeeId = text;
      } else {
        record[field] = text;
      }
    }

    const hasAnyValue = Object.values(record).some((value) => value !== "");
    if (!hasAnyValue) {
      continue;
    }

    rows.push({
      ...record,
      rowNumber,
      dateErrors: dateErrors.length ? dateErrors : undefined,
    } as ExcelRow & { dateErrors?: string[] });
  }

  return { ok: true as const, rows: rows as Array<ExcelRow & { dateErrors?: string[] }> };
}
