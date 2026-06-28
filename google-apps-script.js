/**
 * Newport Chess Outreach — Google Sheets backend (Camp Registration Only)
 * ----------------------------------------------------------------------------
 * This is NOT a file you upload. Instead:
 *
 *   1. Create a new Google Sheet (sheets.new) — name it something like
 *      "Knight4Life Summer Camp 2026 — Registrations"
 *   2. In that Sheet, go to Extensions → Apps Script
 *   3. Delete the placeholder code and paste everything below
 *   4. Click Deploy → New deployment → select type "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Click Deploy, authorize when Google asks, copy the Web App URL
 *   6. Paste that URL into SHEETS_WEB_APP_URL in Netlify environment variables
 *
 * A "Registrations" tab is created automatically on the first submission.
 * ----------------------------------------------------------------------------
 */

const REGISTRATION_HEADERS = [
  "timestamp", "registrationId", "eventTitle", "eventSlug",
  "participantFirstName", "participantLastName", "gradeLevel", "school", "experienceLevel",
  "nwChessRating", "uscfRating",
  "medicalConditions", "allergies", "accommodations",
  "parentFirstName", "parentLastName", "parentEmail", "parentPhone",
  "parentAddress", "parentCity", "parentState", "parentZip",
  "emergencyFirstName", "emergencyLastName", "emergencyPhone",
  "waiverLiability", "waiverPhoto", "waiverMedical", "waiverTerms",
  "amountCents", "paymentStatus", "stripeSessionId"
];

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ ok: false, error: "Invalid JSON" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    if (data.action === "newRegistration") {
      data.timestamp = new Date();
      const sheet = getOrCreateSheet(ss, "Registrations", REGISTRATION_HEADERS);
      sheet.appendRow(REGISTRATION_HEADERS.map((h) => (data[h] !== undefined ? data[h] : "")));
      return respond({ ok: true });
    }

    if (data.action === "markPaid") {
      const sheet     = getOrCreateSheet(ss, "Registrations", REGISTRATION_HEADERS);
      const idCol     = REGISTRATION_HEADERS.indexOf("registrationId") + 1;
      const statusCol = REGISTRATION_HEADERS.indexOf("paymentStatus") + 1;
      const sessionCol = REGISTRATION_HEADERS.indexOf("stripeSessionId") + 1;
      const values    = sheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][idCol - 1]) === String(data.registrationId)) {
          sheet.getRange(i + 1, statusCol).setValue("Paid");
          sheet.getRange(i + 1, sessionCol).setValue(data.stripeSessionId || "");
          break;
        }
      }
      return respond({ ok: true });
    }

    return respond({ ok: false, error: "Unknown action: " + data.action });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
