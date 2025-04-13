import { test, expect } from '@playwright/test';

test.describe('Document Upload Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirection to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should upload a document successfully', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/documents/upload');
    
    // Verify page title and form elements
    expect(await page.title()).toContain('Upload Document');
    expect(await page.isVisible('text=Upload Document')).toBeTruthy();
    
    // Fill form fields
    await page.setInputFiles('input[type="file"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Test document content')
    });
    
    await page.fill('input[name="documentName"]', 'Test Document Title');
    await page.fill('textarea[name="documentDescription"]', 'This is a test document description');
    await page.fill('input[name="documentTags"]', 'test, e2e, automation');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for upload and redirection
    await page.waitForURL(url => url.pathname.startsWith('/documents/'));
    
    // Verify document was uploaded successfully
    expect(await page.isVisible('text=Test Document Title')).toBeTruthy();
    expect(await page.isVisible('text=This is a test document description')).toBeTruthy();
    
    // Verify tags are displayed
    expect(await page.isVisible('text=test')).toBeTruthy();
    expect(await page.isVisible('text=e2e')).toBeTruthy();
    expect(await page.isVisible('text=automation')).toBeTruthy();
  });
  
  test('should show validation errors for invalid uploads', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/documents/upload');
    
    // Try to submit without selecting a file
    await page.click('button[type="submit"]');
    
    // Verify error message
    expect(await page.isVisible('text=Please select a file to upload')).toBeTruthy();
    
    // Set an invalid file (text file instead of PDF)
    await page.setInputFiles('input[type="file"]', {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Invalid file type')
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify error message about file type
    expect(await page.isVisible('text=File type text/plain is not supported')).toBeTruthy();
  });
  
  test('should allow downloading the uploaded document', async ({ page, context }) => {
    // Navigate to a document page (assumes document exists)
    await page.goto('/dashboard');
    
    // Click on the first document
    await page.click('.document-item >> nth=0');
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.click('button:has-text("Download Document")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download details
    expect(download.suggestedFilename()).toBeTruthy();
  });
}); 