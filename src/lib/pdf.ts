/**
 * Branded invoice PDF generator using @react-pdf/renderer
 * Generates a Label Origin styled PDF from Zoho Books invoice data.
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";

// ── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  itemTotal: number;
  taxPercentage?: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  referenceNumber?: string;
  currency: string;
  currencySymbol: string;

  // Client
  clientName: string;
  clientAddress?: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  subTotal: number;
  taxTotal: number;
  total: number;
  balanceDue: number;

  // Optional
  notes?: string;
  terms?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number, symbol: string) {
  return `${symbol}${Number(amount).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────

const c = {
  dark:    "#1d1d1f",
  gray:    "#86868b",
  light:   "#f5f5f7",
  border:  "#e5e5e7",
  blue:    "#0071e3",
  white:   "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: c.dark,
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: c.white,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brandName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    color: c.dark,
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: 7.5,
    color: c.gray,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  invoiceLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: c.gray,
    textTransform: "uppercase",
    textAlign: "right",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
    textAlign: "right",
    letterSpacing: -0.5,
  },

  // Accent bar
  accentBar: {
    backgroundColor: c.dark,
    borderRadius: 8,
    padding: "12 16",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  accentLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  accentValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.white,
  },
  accentValueLarge: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    letterSpacing: -0.3,
  },

  // Addresses
  addresses: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 28,
  },
  addressBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: c.gray,
    textTransform: "uppercase",
    marginBottom: 6,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: c.border,
  },
  clientName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
    marginBottom: 3,
  },
  addressText: {
    fontSize: 8.5,
    color: c.gray,
    lineHeight: 1.5,
  },
  companyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
    marginBottom: 3,
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: c.light,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 0,
  },
  tableHeaderText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: c.gray,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: c.light,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  itemName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 8,
    color: c.gray,
    lineHeight: 1.4,
  },
  cellRight: {
    textAlign: "right",
    fontSize: 9,
    color: c.dark,
  },

  // Col widths
  colItem:   { flex: 3 },
  colQty:    { flex: 0.7, textAlign: "right" },
  colRate:   { flex: 1, textAlign: "right" },
  colTax:    { flex: 0.8, textAlign: "right" },
  colAmount: { flex: 1.1, textAlign: "right" },

  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  totalsTable: {
    width: 200,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: c.gray,
  },
  totalsValue: {
    fontSize: 8.5,
    color: c.dark,
  },
  totalsDivider: {
    borderTopWidth: 0.5,
    borderTopColor: c.border,
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
  },
  totalValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: c.light,
    borderRadius: 6,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
  },
  balanceValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: c.dark,
  },

  // Notes
  notesSection: {
    flexDirection: "row",
    gap: 40,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: c.border,
  },
  notesBlock: { flex: 1 },
  notesLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: c.gray,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8.5,
    color: c.gray,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: c.border,
    paddingTop: 12,
  },
  footerBrand: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: c.dark,
    textTransform: "uppercase",
  },
  footerText: {
    fontSize: 7.5,
    color: c.gray,
    textAlign: "right",
  },
});

// ── Document component ────────────────────────────────────────────────────────

function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  const sym = data.currencySymbol || "£";

  return React.createElement(
    Document,
    { title: `Invoice ${data.invoiceNumber}` },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // ── Header ──
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.brandName }, "Label Origin"),
          React.createElement(
            Text,
            { style: styles.brandSub },
            "UK Contract Manufacturer · ISO9001 Accredited"
          )
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.invoiceLabel }, "Invoice"),
          React.createElement(Text, { style: styles.invoiceNumber }, data.invoiceNumber)
        )
      ),

      // ── Accent bar ──
      React.createElement(
        View,
        { style: styles.accentBar },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.accentLabel }, "Invoice date"),
          React.createElement(Text, { style: styles.accentValue }, fmtDate(data.date))
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.accentLabel }, "Due date"),
          React.createElement(Text, { style: styles.accentValue }, fmtDate(data.dueDate))
        ),
        data.referenceNumber
          ? React.createElement(
              View,
              null,
              React.createElement(Text, { style: styles.accentLabel }, "Reference"),
              React.createElement(Text, { style: styles.accentValue }, data.referenceNumber)
            )
          : null,
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.accentLabel }, "Amount due"),
          React.createElement(
            Text,
            { style: styles.accentValueLarge },
            fmt(data.balanceDue, sym)
          )
        )
      ),

      // ── Addresses ──
      React.createElement(
        View,
        { style: styles.addresses },
        React.createElement(
          View,
          { style: styles.addressBlock },
          React.createElement(Text, { style: styles.sectionLabel }, "Bill to"),
          React.createElement(Text, { style: styles.clientName }, data.clientName),
          data.clientAddress
            ? React.createElement(Text, { style: styles.addressText }, data.clientAddress)
            : null
        ),
        React.createElement(
          View,
          { style: styles.addressBlock },
          React.createElement(Text, { style: styles.sectionLabel }, "From"),
          React.createElement(Text, { style: styles.companyName }, "Label Origin Ltd"),
          React.createElement(
            Text,
            { style: styles.addressText },
            "Manchester, United Kingdom\nhello@labelorigin.com\nlabelorigin.com"
          )
        )
      ),

      // ── Table header ──
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(Text, { style: [styles.tableHeaderText, styles.colItem] }, "Item"),
        React.createElement(Text, { style: [styles.tableHeaderText, styles.colQty] }, "Qty"),
        React.createElement(Text, { style: [styles.tableHeaderText, styles.colRate] }, "Rate"),
        React.createElement(Text, { style: [styles.tableHeaderText, styles.colTax] }, "Tax"),
        React.createElement(Text, { style: [styles.tableHeaderText, styles.colAmount] }, "Amount")
      ),

      // ── Line items ──
      ...data.lineItems.map((item, i) =>
        React.createElement(
          View,
          {
            key: i,
            style: i === data.lineItems.length - 1
              ? [styles.tableRow, styles.tableRowLast]
              : styles.tableRow,
          },
          React.createElement(
            View,
            { style: styles.colItem },
            React.createElement(Text, { style: styles.itemName }, item.name),
            item.description
              ? React.createElement(Text, { style: styles.itemDesc }, item.description)
              : null
          ),
          React.createElement(
            Text,
            { style: [styles.cellRight, styles.colQty] },
            String(item.quantity)
          ),
          React.createElement(
            Text,
            { style: [styles.cellRight, styles.colRate] },
            fmt(item.rate, sym)
          ),
          React.createElement(
            Text,
            { style: [styles.cellRight, styles.colTax] },
            item.taxPercentage ? `${item.taxPercentage}%` : "0%"
          ),
          React.createElement(
            Text,
            { style: [styles.cellRight, styles.colAmount] },
            fmt(item.itemTotal, sym)
          )
        )
      ),

      // ── Totals ──
      React.createElement(
        View,
        { style: styles.totalsSection },
        React.createElement(
          View,
          { style: styles.totalsTable },
          React.createElement(
            View,
            { style: styles.totalsRow },
            React.createElement(Text, { style: styles.totalsLabel }, "Subtotal"),
            React.createElement(Text, { style: styles.totalsValue }, fmt(data.subTotal, sym))
          ),
          data.taxTotal > 0
            ? React.createElement(
                View,
                { style: styles.totalsRow },
                React.createElement(Text, { style: styles.totalsLabel }, "Tax"),
                React.createElement(Text, { style: styles.totalsValue }, fmt(data.taxTotal, sym))
              )
            : null,
          React.createElement(View, { style: styles.totalsDivider }),
          React.createElement(
            View,
            { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, "Total"),
            React.createElement(Text, { style: styles.totalValue }, fmt(data.total, sym))
          ),
          React.createElement(
            View,
            { style: styles.balanceRow },
            React.createElement(Text, { style: styles.balanceLabel }, "Balance due"),
            React.createElement(Text, { style: styles.balanceValue }, fmt(data.balanceDue, sym))
          )
        )
      ),

      // ── Notes & Terms ──
      (data.notes || data.terms)
        ? React.createElement(
            View,
            { style: styles.notesSection },
            data.notes
              ? React.createElement(
                  View,
                  { style: styles.notesBlock },
                  React.createElement(Text, { style: styles.notesLabel }, "Notes"),
                  React.createElement(Text, { style: styles.notesText }, data.notes)
                )
              : null,
            data.terms
              ? React.createElement(
                  View,
                  { style: styles.notesBlock },
                  React.createElement(Text, { style: styles.notesLabel }, "Terms"),
                  React.createElement(Text, { style: styles.notesText }, data.terms)
                )
              : null
          )
        : null,

      // ── Footer ──
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerBrand }, "Label Origin"),
        React.createElement(
          Text,
          { style: styles.footerText },
          "Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited"
        )
      )
    )
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const doc = React.createElement(InvoiceDocument, { data });
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
