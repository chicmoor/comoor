  function doPost(e) {
    try {
      // Parse the incoming data
      let data;

      // Check if data comes from FormData (parameter.data) or JSON (postData.contents)
      if (e.parameter && e.parameter.data) {
        data = JSON.parse(e.parameter.data);
      } else if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      } else {
        throw new Error('No data received');
      }

      // Get submission type (default to 'contact' for backward compatibility)
      const type = e.parameter.type || 'contact';
      const ss = SpreadsheetApp.getActiveSpreadsheet();

      // Route to appropriate handler based on type
      if (type === 'comment') {
        return handleCommentSubmission(data, ss);
      } else {
        return handleContactFormSubmission(data, ss);
      }

    } catch (error) {
      // Return error response
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: error.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Handle contact form submissions (original logic)
  function handleContactFormSubmission(data, ss) {
    // Find the sheet with gid 2018488710
    const sheets = ss.getSheets();
    let targetSheet = null;

    for (let sheet of sheets) {
      if (sheet.getSheetId() === 2018488710) {
        targetSheet = sheet;
        break;
      }
    }

    if (!targetSheet) {
      throw new Error('Sheet with gid 2018488710 not found');
    }

    // Prepare the row data
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const rowData = [
      timestamp,
      data.prizeTitle || '',
      data.account || '',
      data.phone || '',
      data.recipientName || '',
      data.address || '',
      data.message || '',
      data.userAgent || ''
    ];

    // Append the row to the sheet
    targetSheet.appendRow(rowData);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        timestamp: timestamp,
        sheetName: targetSheet.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle comment submissions
  function handleCommentSubmission(data, ss) {
    // Find the sheet with gid 1055061914
    const sheets = ss.getSheets();
    let commentSheet = null;

    for (let sheet of sheets) {
      if (sheet.getSheetId() === 1055061914) {
        commentSheet = sheet;
        break;
      }
    }

    if (!commentSheet) {
      throw new Error('Sheet with gid 1055061914 not found');
    }

    // Prepare the row data (only 3 fields)
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const rowData = [
      timestamp,
      data.storyTitle || '',
      data.commentText || ''
    ];

    // Append the row to the sheet
    commentSheet.appendRow(rowData);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Comment submitted successfully',
        timestamp: timestamp,
        sheetName: commentSheet.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }