import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WidgetConfig {
  appearance: {
    primaryColor: string;
    position: string;
    buttonText: string;
    headerTitle: string;
    showBranding: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    collectEmail: boolean;
    greetingMessage: string;
  };
}

interface Widget {
  id: string;
  name: string;
  widget_type: string;
  config: WidgetConfig;
  allowed_domains: string[];
  is_active: boolean;
}

function generateLawyerSearchLoader(widget: Widget, supabaseUrl: string): string {
  const config = widget.config;
  return `
(function() {
  if (window.EZLegalLawyerSearch) return;

  var WIDGET_ID = '${widget.id}';
  var SUPABASE_URL = '${supabaseUrl}';
  var CONFIG = ${JSON.stringify(config)};

  var style = document.createElement('style');
  style.textContent = \`
    .ezlegal-lawyer-container {
      position: fixed;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : ''}
      \${CONFIG.appearance.position === 'bottom-left' ? 'left: 20px; bottom: 20px;' : ''}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ezlegal-lawyer-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${CONFIG.appearance.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .ezlegal-lawyer-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .ezlegal-lawyer-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    .ezlegal-lawyer-panel {
      position: absolute;
      bottom: 70px;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      width: 400px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .ezlegal-lawyer-panel.open { display: flex; }
    .ezlegal-lawyer-header {
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ezlegal-lawyer-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .ezlegal-lawyer-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
    }
    .ezlegal-lawyer-body { padding: 20px; }
    .ezlegal-search-form { display: flex; flex-direction: column; gap: 12px; }
    .ezlegal-form-group { display: flex; flex-direction: column; gap: 4px; }
    .ezlegal-form-group label { font-size: 12px; font-weight: 600; color: #475569; }
    .ezlegal-form-group select,
    .ezlegal-form-group input {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }
    .ezlegal-search-btn {
      padding: 12px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }
    .ezlegal-results { margin-top: 16px; }
    .ezlegal-lawyer-card {
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .ezlegal-lawyer-name { font-weight: 600; color: #1e293b; }
    .ezlegal-lawyer-specialty { font-size: 12px; color: #64748b; margin-top: 2px; }
    .ezlegal-lawyer-contact {
      margin-top: 8px;
      padding: 8px 12px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .ezlegal-lawyer-footer {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .ezlegal-lawyer-footer a { color: #64748b; text-decoration: none; }
  \`;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'ezlegal-lawyer-container';
  container.innerHTML = \`
    <div class="ezlegal-lawyer-panel" id="ezlegal-lawyer-panel">
      <div class="ezlegal-lawyer-header">
        <h3>Find a Lawyer</h3>
        <button class="ezlegal-lawyer-close" onclick="EZLegalLawyerSearch.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ezlegal-lawyer-body">
        <div class="ezlegal-search-form">
          <div class="ezlegal-form-group">
            <label>Practice Area</label>
            <select id="ezlegal-practice-area">
              <option value="">Select practice area...</option>
              <option value="family">Family Law</option>
              <option value="housing">Housing & Tenant Rights</option>
              <option value="employment">Employment Law</option>
              <option value="immigration">Immigration</option>
              <option value="business">Business Law</option>
              <option value="criminal">Criminal Defense</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="estate">Estate Planning</option>
            </select>
          </div>
          <div class="ezlegal-form-group">
            <label>Location (City or ZIP)</label>
            <input type="text" id="ezlegal-location" placeholder="e.g., Phoenix, AZ" />
          </div>
          <button class="ezlegal-search-btn" onclick="EZLegalLawyerSearch.search()">Search Lawyers</button>
        </div>
        <div class="ezlegal-results" id="ezlegal-results"></div>
      </div>
      \${CONFIG.appearance.showBranding ? '<div class="ezlegal-lawyer-footer">Powered by <a href="https://ezlegal.ai" target="_blank">ezLegal.ai</a></div>' : ''}
    </div>
    <button class="ezlegal-lawyer-button" onclick="EZLegalLawyerSearch.toggle()">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </button>
  \`;
  document.body.appendChild(container);

  var isOpen = false;

  window.EZLegalLawyerSearch = {
    toggle: function() { isOpen ? this.close() : this.open(); },
    open: function() {
      isOpen = true;
      document.getElementById('ezlegal-lawyer-panel').classList.add('open');
    },
    close: function() {
      isOpen = false;
      document.getElementById('ezlegal-lawyer-panel').classList.remove('open');
    },
    search: function() {
      var practiceArea = document.getElementById('ezlegal-practice-area').value;
      var location = document.getElementById('ezlegal-location').value;
      var resultsEl = document.getElementById('ezlegal-results');

      resultsEl.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;">Searching...</p>';

      fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lawyer_search',
          widgetId: WIDGET_ID,
          practiceArea: practiceArea,
          location: location
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.lawyers && data.lawyers.length > 0) {
          resultsEl.innerHTML = data.lawyers.map(function(l) {
            return '<div class="ezlegal-lawyer-card">' +
              '<div class="ezlegal-lawyer-name">' + l.name + '</div>' +
              '<div class="ezlegal-lawyer-specialty">' + l.specialty + ' - ' + l.location + '</div>' +
              '<button class="ezlegal-lawyer-contact" onclick="window.open(\\'' + l.profileUrl + '\\', \\'_blank\\')">View Profile</button>' +
            '</div>';
          }).join('');
        } else {
          resultsEl.innerHTML = '<p style="text-align:center;color:#64748b;padding:20px;">No lawyers found. Try different criteria.</p>';
        }
      })
      .catch(function() {
        resultsEl.innerHTML = '<p style="text-align:center;color:#ef4444;padding:20px;">Error searching. Please try again.</p>';
      });
    }
  };
})();
`;
}

function generateContactFormLoader(widget: Widget, supabaseUrl: string): string {
  const config = widget.config;
  return `
(function() {
  if (window.EZLegalContact) return;

  var WIDGET_ID = '${widget.id}';
  var SUPABASE_URL = '${supabaseUrl}';
  var CONFIG = ${JSON.stringify(config)};

  var style = document.createElement('style');
  style.textContent = \`
    .ezlegal-contact-container {
      position: fixed;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : ''}
      \${CONFIG.appearance.position === 'bottom-left' ? 'left: 20px; bottom: 20px;' : ''}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ezlegal-contact-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${CONFIG.appearance.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    }
    .ezlegal-contact-button:hover { transform: scale(1.05); }
    .ezlegal-contact-button svg { width: 28px; height: 28px; fill: white; }
    .ezlegal-contact-panel {
      position: absolute;
      bottom: 70px;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      width: 380px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .ezlegal-contact-panel.open { display: flex; }
    .ezlegal-contact-header {
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ezlegal-contact-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .ezlegal-contact-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
    }
    .ezlegal-contact-body { padding: 20px; }
    .ezlegal-contact-form { display: flex; flex-direction: column; gap: 12px; }
    .ezlegal-contact-input {
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }
    .ezlegal-contact-textarea {
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      min-height: 100px;
      resize: vertical;
    }
    .ezlegal-contact-submit {
      padding: 12px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .ezlegal-contact-success {
      text-align: center;
      padding: 40px 20px;
    }
    .ezlegal-contact-success svg { color: #22c55e; margin-bottom: 12px; }
    .ezlegal-contact-footer {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  \`;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'ezlegal-contact-container';
  container.innerHTML = \`
    <div class="ezlegal-contact-panel" id="ezlegal-contact-panel">
      <div class="ezlegal-contact-header">
        <h3>\${CONFIG.appearance.headerTitle || 'Contact Us'}</h3>
        <button class="ezlegal-contact-close" onclick="EZLegalContact.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ezlegal-contact-body" id="ezlegal-contact-body">
        <form class="ezlegal-contact-form" id="ezlegal-contact-form" onsubmit="EZLegalContact.submit(event)">
          <input type="text" class="ezlegal-contact-input" name="name" placeholder="Your Name" required />
          <input type="email" class="ezlegal-contact-input" name="email" placeholder="Your Email" required />
          <input type="tel" class="ezlegal-contact-input" name="phone" placeholder="Phone Number (optional)" />
          <select class="ezlegal-contact-input" name="legalIssue" required>
            <option value="">Select Legal Issue...</option>
            <option value="family">Family Law</option>
            <option value="housing">Housing / Landlord</option>
            <option value="employment">Employment</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
          <textarea class="ezlegal-contact-textarea" name="message" placeholder="Briefly describe your situation..." required></textarea>
          <button type="submit" class="ezlegal-contact-submit">Send Message</button>
        </form>
      </div>
      \${CONFIG.appearance.showBranding ? '<div class="ezlegal-contact-footer">Powered by <a href="https://ezlegal.ai" target="_blank">ezLegal.ai</a></div>' : ''}
    </div>
    <button class="ezlegal-contact-button" onclick="EZLegalContact.toggle()">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    </button>
  \`;
  document.body.appendChild(container);

  var isOpen = false;

  window.EZLegalContact = {
    toggle: function() { isOpen ? this.close() : this.open(); },
    open: function() {
      isOpen = true;
      document.getElementById('ezlegal-contact-panel').classList.add('open');
    },
    close: function() {
      isOpen = false;
      document.getElementById('ezlegal-contact-panel').classList.remove('open');
    },
    submit: function(e) {
      e.preventDefault();
      var form = document.getElementById('ezlegal-contact-form');
      var data = new FormData(form);
      var body = document.getElementById('ezlegal-contact-body');

      fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contact_submit',
          widgetId: WIDGET_ID,
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          legalIssue: data.get('legalIssue'),
          message: data.get('message'),
          domain: window.location.hostname
        })
      })
      .then(function() {
        body.innerHTML = '<div class="ezlegal-contact-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><h4 style="margin:0 0 8px;color:#1e293b;">Message Sent!</h4><p style="margin:0;color:#64748b;font-size:14px;">We\\'ll get back to you soon.</p></div>';
      })
      .catch(function() {
        alert('Error sending message. Please try again.');
      });
    }
  };
})();
`;
}

function generateDocumentAnalyzerLoader(widget: Widget, supabaseUrl: string): string {
  const config = widget.config;
  return `
(function() {
  if (window.EZLegalDocAnalyzer) return;

  var WIDGET_ID = '${widget.id}';
  var SUPABASE_URL = '${supabaseUrl}';
  var CONFIG = ${JSON.stringify(config)};

  var style = document.createElement('style');
  style.textContent = \`
    .ezlegal-doc-container {
      position: fixed;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : ''}
      \${CONFIG.appearance.position === 'bottom-left' ? 'left: 20px; bottom: 20px;' : ''}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ezlegal-doc-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${CONFIG.appearance.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    }
    .ezlegal-doc-button:hover { transform: scale(1.05); }
    .ezlegal-doc-button svg { width: 28px; height: 28px; fill: white; }
    .ezlegal-doc-panel {
      position: absolute;
      bottom: 70px;
      \${CONFIG.appearance.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      width: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .ezlegal-doc-panel.open { display: flex; }
    .ezlegal-doc-header {
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ezlegal-doc-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .ezlegal-doc-close { background: none; border: none; color: white; cursor: pointer; }
    .ezlegal-doc-body { padding: 20px; }
    .ezlegal-doc-upload {
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .ezlegal-doc-upload:hover {
      border-color: \${CONFIG.appearance.primaryColor};
      background: #f8fafc;
    }
    .ezlegal-doc-upload.dragover {
      border-color: \${CONFIG.appearance.primaryColor};
      background: #eff6ff;
    }
    .ezlegal-doc-upload svg { color: #94a3b8; margin-bottom: 8px; }
    .ezlegal-doc-upload p { margin: 0; color: #64748b; font-size: 14px; }
    .ezlegal-doc-upload span { color: \${CONFIG.appearance.primaryColor}; font-weight: 600; }
    .ezlegal-doc-analyzing {
      text-align: center;
      padding: 32px;
    }
    .ezlegal-doc-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: \${CONFIG.appearance.primaryColor};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ezlegal-doc-result { padding: 16px; }
    .ezlegal-doc-score {
      text-align: center;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .ezlegal-doc-score-value {
      font-size: 48px;
      font-weight: 700;
      color: \${CONFIG.appearance.primaryColor};
    }
    .ezlegal-doc-issues { margin-top: 12px; }
    .ezlegal-doc-issue {
      padding: 10px 12px;
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #991b1b;
    }
    .ezlegal-doc-footer {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  \`;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'ezlegal-doc-container';
  container.innerHTML = \`
    <div class="ezlegal-doc-panel" id="ezlegal-doc-panel">
      <div class="ezlegal-doc-header">
        <h3>Document Analyzer</h3>
        <button class="ezlegal-doc-close" onclick="EZLegalDocAnalyzer.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="ezlegal-doc-body" id="ezlegal-doc-body">
        <div class="ezlegal-doc-upload" id="ezlegal-doc-dropzone">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p><span>Click to upload</span> or drag and drop</p>
          <p style="font-size:12px;margin-top:4px;">PDF, DOC, DOCX (max 10MB)</p>
          <input type="file" id="ezlegal-doc-input" accept=".pdf,.doc,.docx" style="display:none" />
        </div>
      </div>
      \${CONFIG.appearance.showBranding ? '<div class="ezlegal-doc-footer">Powered by <a href="https://ezlegal.ai" target="_blank">ezLegal.ai</a></div>' : ''}
    </div>
    <button class="ezlegal-doc-button" onclick="EZLegalDocAnalyzer.toggle()">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
      </svg>
    </button>
  \`;
  document.body.appendChild(container);

  var isOpen = false;
  var dropzone = document.getElementById('ezlegal-doc-dropzone');
  var fileInput = document.getElementById('ezlegal-doc-input');

  dropzone.addEventListener('click', function() { fileInput.click(); });
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', function() {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) EZLegalDocAnalyzer.analyze(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length) EZLegalDocAnalyzer.analyze(fileInput.files[0]);
  });

  window.EZLegalDocAnalyzer = {
    toggle: function() { isOpen ? this.close() : this.open(); },
    open: function() {
      isOpen = true;
      document.getElementById('ezlegal-doc-panel').classList.add('open');
    },
    close: function() {
      isOpen = false;
      document.getElementById('ezlegal-doc-panel').classList.remove('open');
    },
    analyze: function(file) {
      var body = document.getElementById('ezlegal-doc-body');
      body.innerHTML = '<div style="padding:24px;text-align:center;">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-bottom:12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' +
        '<p style="color:#475569;font-size:14px;font-weight:500;margin:0 0 8px;">Demo only</p>' +
        '<p style="color:#64748b;font-size:13px;margin:0;">Upload disabled in this embedded preview. <a href="https://ezlegal.ai" target="_blank" style="color:' + CONFIG.appearance.primaryColor + ';font-weight:500;">Sign in to ezLegal.ai</a> for real document analysis.</p>' +
      '</div>';
    }
  };
})();
`;
}

function generateWidgetLoader(widget: Widget, supabaseUrl: string): string {
  const config = widget.config;
  const features = config.features || {};
  return `
(function() {
  if (window.EZLegalWidget) return;

  var WIDGET_ID = '${widget.id}';
  var SUPABASE_URL = '${supabaseUrl}';
  var CONFIG = ${JSON.stringify(config)};
  var FEATURES = CONFIG.features || {};

  var style = document.createElement('style');
  style.textContent = \`
    .ezlegal-widget-container {
      position: fixed;
      ${config.appearance.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : ''}
      ${config.appearance.position === 'bottom-left' ? 'left: 20px; bottom: 20px;' : ''}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ezlegal-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, \${CONFIG.appearance.primaryColor} 0%, \${CONFIG.appearance.primaryColor}dd 100%);
      border: 3px solid rgba(255,255,255,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,103,255,0.4), 0 0 0 0 rgba(0,103,255,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: ezlegal-pulse 2s infinite;
      position: relative;
    }
    @keyframes ezlegal-pulse {
      0% { box-shadow: 0 4px 20px rgba(0,103,255,0.4), 0 0 0 0 rgba(0,103,255,0.4); }
      70% { box-shadow: 0 4px 20px rgba(0,103,255,0.4), 0 0 0 12px rgba(0,103,255,0); }
      100% { box-shadow: 0 4px 20px rgba(0,103,255,0.4), 0 0 0 0 rgba(0,103,255,0); }
    }
    .ezlegal-widget-button:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0,103,255,0.5);
      animation: none;
    }
    .ezlegal-widget-button svg {
      width: 30px;
      height: 30px;
      fill: white;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
    }
    .ezlegal-widget-badge {
      position: absolute;
      bottom: 100%;
      right: 0;
      margin-bottom: 8px;
      background: white;
      color: #1e293b;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      white-space: nowrap;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.3s, transform 0.3s;
    }
    .ezlegal-widget-badge::after {
      content: '';
      position: absolute;
      top: 100%;
      right: 20px;
      border: 6px solid transparent;
      border-top-color: white;
    }
    .ezlegal-widget-badge.hidden {
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
    }
    .ezlegal-widget-badge span {
      color: \${CONFIG.appearance.primaryColor};
    }
    .ezlegal-widget-panel {
      position: absolute;
      bottom: 70px;
      ${config.appearance.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
      width: 400px;
      max-height: 650px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .ezlegal-widget-panel.open { display: flex; }
    .ezlegal-widget-header {
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ezlegal-widget-header h3 { margin: 0; font-size: 17px; font-weight: 600; }
    .ezlegal-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.9;
    }
    .ezlegal-widget-close:hover { opacity: 1; }
    .ezlegal-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .ezlegal-tab {
      flex: 1;
      padding: 10px 8px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .ezlegal-tab:hover { background: #f1f5f9; }
    .ezlegal-tab.active {
      color: \${CONFIG.appearance.primaryColor};
      background: white;
      border-bottom: 2px solid \${CONFIG.appearance.primaryColor};
    }
    .ezlegal-tab svg { width: 18px; height: 18px; }
    .ezlegal-tab-content { display: none; flex-direction: column; flex: 1; overflow: hidden; }
    .ezlegal-tab-content.active { display: flex; }
    .ezlegal-widget-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      max-height: 320px;
    }
    .ezlegal-widget-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ezlegal-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
    }
    .ezlegal-message.bot {
      background: #f1f5f9;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ezlegal-message.user {
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ezlegal-widget-input-container {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }
    .ezlegal-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    .ezlegal-widget-input:focus { border-color: \${CONFIG.appearance.primaryColor}; }
    .ezlegal-widget-send {
      padding: 10px 16px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }
    .ezlegal-widget-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .ezlegal-widget-footer {
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .ezlegal-widget-footer a { color: #64748b; text-decoration: none; }
    .ezlegal-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #f1f5f9;
      border-radius: 12px;
      width: fit-content;
    }
    .ezlegal-typing span {
      width: 8px;
      height: 8px;
      background: #94a3b8;
      border-radius: 50%;
      animation: ezlegal-bounce 1.4s infinite ease-in-out both;
    }
    .ezlegal-typing span:nth-child(1) { animation-delay: -0.32s; }
    .ezlegal-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes ezlegal-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .ezlegal-disclaimer {
      font-size: 10px;
      color: #64748b;
      padding: 8px 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .ezlegal-form-section { padding: 20px; }
    .ezlegal-form-section h4 { margin: 0 0 8px; font-size: 15px; color: #1e293b; }
    .ezlegal-form-section p { margin: 0 0 16px; font-size: 13px; color: #64748b; }
    .ezlegal-form-group { margin-bottom: 12px; }
    .ezlegal-form-group label { display: block; font-size: 12px; font-weight: 500; color: #475569; margin-bottom: 4px; }
    .ezlegal-form-group input, .ezlegal-form-group select, .ezlegal-form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .ezlegal-form-group textarea { min-height: 80px; resize: vertical; }
    .ezlegal-form-group input:focus, .ezlegal-form-group select:focus, .ezlegal-form-group textarea:focus {
      outline: none;
      border-color: \${CONFIG.appearance.primaryColor};
    }
    .ezlegal-submit-btn {
      width: 100%;
      padding: 12px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      margin-top: 8px;
    }
    .ezlegal-submit-btn:hover { opacity: 0.9; }
    .ezlegal-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ezlegal-success {
      text-align: center;
      padding: 32px 20px;
    }
    .ezlegal-success svg { color: #22c55e; margin-bottom: 12px; }
    .ezlegal-success h4 { margin: 0 0 8px; color: #1e293b; }
    .ezlegal-success p { margin: 0; color: #64748b; font-size: 14px; }
    .ezlegal-upload-zone {
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 32px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ezlegal-upload-zone:hover { border-color: \${CONFIG.appearance.primaryColor}; background: #f8fafc; }
    .ezlegal-upload-zone.dragover { border-color: \${CONFIG.appearance.primaryColor}; background: #eff6ff; }
    .ezlegal-upload-zone svg { color: #94a3b8; margin-bottom: 8px; }
    .ezlegal-upload-zone p { margin: 0; color: #64748b; font-size: 14px; }
    .ezlegal-upload-zone span { color: \${CONFIG.appearance.primaryColor}; font-weight: 600; }
    .ezlegal-file-info { margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
    .ezlegal-file-info svg { color: \${CONFIG.appearance.primaryColor}; flex-shrink: 0; }
    .ezlegal-file-info span { font-size: 13px; color: #475569; word-break: break-all; }
    .ezlegal-analyzing { text-align: center; padding: 32px; }
    .ezlegal-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: \${CONFIG.appearance.primaryColor};
      border-radius: 50%;
      animation: ezlegal-spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes ezlegal-spin { to { transform: rotate(360deg); } }
    .ezlegal-analysis-result { padding: 16px; }
    .ezlegal-score-card {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .ezlegal-score-value { font-size: 48px; font-weight: 700; color: \${CONFIG.appearance.primaryColor}; }
    .ezlegal-score-label { font-size: 13px; color: #64748b; }
    .ezlegal-issues { margin-top: 12px; }
    .ezlegal-issue {
      padding: 10px 12px;
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #991b1b;
    }
    .ezlegal-lawyer-results { margin-top: 16px; }
    .ezlegal-lawyer-card {
      padding: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      margin-bottom: 10px;
      transition: box-shadow 0.2s;
    }
    .ezlegal-lawyer-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .ezlegal-lawyer-name { font-weight: 600; color: #1e293b; font-size: 14px; }
    .ezlegal-lawyer-specialty { font-size: 12px; color: #64748b; margin-top: 2px; }
    .ezlegal-lawyer-btn {
      margin-top: 10px;
      padding: 8px 14px;
      background: \${CONFIG.appearance.primaryColor};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
  \`;
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.className = 'ezlegal-widget-container';

  var tabsHtml = '<div class="ezlegal-tabs">';
  tabsHtml += '<button class="ezlegal-tab active" data-tab="chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>Chat</button>';
  if (FEATURES.lawyerSearch) {
    tabsHtml += '<button class="ezlegal-tab" data-tab="lawyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>Find Lawyer</button>';
  }
  if (FEATURES.emailCapture) {
    tabsHtml += '<button class="ezlegal-tab" data-tab="contact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>Contact</button>';
  }
  if (FEATURES.documentUpload) {
    tabsHtml += '<button class="ezlegal-tab" data-tab="document"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>Analyze Doc</button>';
  }
  if (FEATURES.outcomePrediction) {
    tabsHtml += '<button class="ezlegal-tab" data-tab="prediction"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a9 9 0 0 0-9 9c0 3.6 3 6.6 3 11h12c0-4.4 3-7.4 3-11a9 9 0 0 0-9-9z"></path><path d="M9 22h6"></path><path d="M10 22v-4.5"></path><path d="M14 22v-4.5"></path></svg>Predict</button>';
  }
  tabsHtml += '</div>';

  container.innerHTML = \`
    <div class="ezlegal-widget-panel" id="ezlegal-panel">
      <div class="ezlegal-widget-header">
        <h3>\${CONFIG.appearance.headerTitle}</h3>
        <button class="ezlegal-widget-close" onclick="EZLegalWidget.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      \${tabsHtml}
      <div class="ezlegal-tab-content active" id="ezlegal-content-chat">
        <div class="ezlegal-widget-body" id="ezlegal-body">
          <div class="ezlegal-widget-messages" id="ezlegal-messages"></div>
        </div>
        <div class="ezlegal-disclaimer">AI assistant providing legal information, not legal advice. No attorney-client relationship created.</div>
        <div class="ezlegal-widget-input-container">
          <input type="text" class="ezlegal-widget-input" id="ezlegal-input" placeholder="Ask your legal question..." />
          <button class="ezlegal-widget-send" id="ezlegal-send" onclick="EZLegalWidget.send()">Send</button>
        </div>
      </div>
      \${FEATURES.lawyerSearch ? \`
      <div class="ezlegal-tab-content" id="ezlegal-content-lawyer">
        <div class="ezlegal-form-section" id="ezlegal-lawyer-form">
          <h4>Find a Lawyer</h4>
          <p>Get matched with qualified attorneys in your area.</p>
          <div class="ezlegal-form-group">
            <label>Practice Area</label>
            <select id="ezlegal-lawyer-area">
              <option value="">Select practice area...</option>
              <option value="family">Family Law</option>
              <option value="housing">Housing & Tenant Rights</option>
              <option value="employment">Employment Law</option>
              <option value="immigration">Immigration</option>
              <option value="business">Business Law</option>
              <option value="criminal">Criminal Defense</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="estate">Estate Planning</option>
            </select>
          </div>
          <div class="ezlegal-form-group">
            <label>Your Location</label>
            <input type="text" id="ezlegal-lawyer-location" placeholder="City, State or ZIP code" />
          </div>
          <button class="ezlegal-submit-btn" onclick="EZLegalWidget.searchLawyers()">Find Lawyers</button>
        </div>
        <div class="ezlegal-lawyer-results" id="ezlegal-lawyer-results" style="display:none;"></div>
      </div>
      \` : ''}
      \${FEATURES.emailCapture ? \`
      <div class="ezlegal-tab-content" id="ezlegal-content-contact">
        <div class="ezlegal-form-section" id="ezlegal-contact-form">
          <h4>Get in Touch</h4>
          <p>Have questions? Leave your details and we'll follow up.</p>
          <div class="ezlegal-form-group">
            <label>Your Name</label>
            <input type="text" id="ezlegal-contact-name" placeholder="Full name" />
          </div>
          <div class="ezlegal-form-group">
            <label>Email Address</label>
            <input type="email" id="ezlegal-contact-email" placeholder="email@example.com" />
          </div>
          <div class="ezlegal-form-group">
            <label>Legal Issue</label>
            <select id="ezlegal-contact-issue">
              <option value="">Select issue type...</option>
              <option value="family">Family Law</option>
              <option value="housing">Housing / Landlord</option>
              <option value="employment">Employment</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="ezlegal-form-group">
            <label>Message</label>
            <textarea id="ezlegal-contact-message" placeholder="Briefly describe your situation..."></textarea>
          </div>
          <button class="ezlegal-submit-btn" onclick="EZLegalWidget.submitContact()">Send Message</button>
        </div>
      </div>
      \` : ''}
      \${FEATURES.documentUpload ? \`
      <div class="ezlegal-tab-content" id="ezlegal-content-document">
        <div class="ezlegal-form-section" id="ezlegal-doc-form">
          <h4>Document Analysis</h4>
          <p>Upload a legal document for AI-powered review.</p>
          <div class="ezlegal-upload-zone" id="ezlegal-dropzone">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p><span>Click to upload</span> or drag and drop</p>
            <p style="font-size:12px;margin-top:4px;color:#94a3b8;">PDF, DOC, DOCX (max 10MB)</p>
            <input type="file" id="ezlegal-doc-input" accept=".pdf,.doc,.docx" style="display:none" />
          </div>
          <div class="ezlegal-file-info" id="ezlegal-file-info" style="display:none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span id="ezlegal-file-name"></span>
          </div>
          <button class="ezlegal-submit-btn" id="ezlegal-analyze-btn" onclick="EZLegalWidget.analyzeDocument()" style="display:none;">Analyze Document</button>
        </div>
        <div id="ezlegal-doc-results" style="display:none;"></div>
      </div>
      \` : ''}
      \${FEATURES.outcomePrediction ? \`
      <div class="ezlegal-tab-content" id="ezlegal-content-prediction">
        <div class="ezlegal-form-section" id="ezlegal-prediction-form">
          <h4>Case Outcome Prediction</h4>
          <p>Get AI-powered analysis of potential case outcomes.</p>
          <div class="ezlegal-form-group">
            <label>Jurisdiction</label>
            <select id="ezlegal-pred-jurisdiction">
              <option value="">Select state...</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
              <option value="DC">Washington D.C.</option>
              <option value="FED">Federal Court</option>
            </select>
          </div>
          <div class="ezlegal-form-group">
            <label>Legal Category</label>
            <select id="ezlegal-pred-category">
              <option value="">Select category...</option>
              <option value="family">Family Law</option>
              <option value="housing">Housing & Tenant Rights</option>
              <option value="employment">Employment Law</option>
              <option value="consumer">Consumer Protection</option>
              <option value="business">Business Disputes</option>
              <option value="personal_injury">Personal Injury</option>
              <option value="criminal">Criminal Defense</option>
              <option value="immigration">Immigration</option>
              <option value="civil_rights">Civil Rights</option>
              <option value="estate">Estate & Probate</option>
            </select>
          </div>
          <div class="ezlegal-form-group">
            <label>Brief Case Description</label>
            <textarea id="ezlegal-pred-description" placeholder="Describe the key facts of your case..." style="min-height:60px;"></textarea>
          </div>
          <button class="ezlegal-submit-btn" onclick="EZLegalWidget.predictOutcome()">Analyze Case</button>
        </div>
        <div id="ezlegal-prediction-results" style="display:none;"></div>
      </div>
      \` : ''}
      \${CONFIG.appearance.showBranding ? '<div class="ezlegal-widget-footer">Powered by <a href="https://ezlegal.ai" target="_blank">ezLegal.ai</a></div>' : ''}
    </div>
    <div class="ezlegal-widget-badge" id="ezlegal-badge">
      <span>Free</span> Legal Help
    </div>
    <button class="ezlegal-widget-button" onclick="EZLegalWidget.toggle()" aria-label="Open Legal Assistant">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
      </svg>
    </button>
  \`;
  document.body.appendChild(container);

  var visitorId = localStorage.getItem('ezlegal_visitor_id') || 'v_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('ezlegal_visitor_id', visitorId);
  var messages = [];
  var isOpen = false;
  var selectedFile = null;

  document.querySelectorAll('.ezlegal-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.ezlegal-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.ezlegal-tab-content').forEach(function(c) { c.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('ezlegal-content-' + tab.dataset.tab).classList.add('active');
    });
  });

  if (FEATURES.documentUpload) {
    var dropzone = document.getElementById('ezlegal-dropzone');
    var fileInput = document.getElementById('ezlegal-doc-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', function() { fileInput.click(); });
      dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('dragover'); });
      dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) EZLegalWidget.selectFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', function() {
        if (fileInput.files.length) EZLegalWidget.selectFile(fileInput.files[0]);
      });
    }
  }

  function addMessage(text, isBot) {
    messages.push({ text: text, isBot: isBot, timestamp: new Date().toISOString() });
    var messagesEl = document.getElementById('ezlegal-messages');
    var messageEl = document.createElement('div');
    messageEl.className = 'ezlegal-message ' + (isBot ? 'bot' : 'user');
    messageEl.textContent = text;
    messagesEl.appendChild(messageEl);
    document.getElementById('ezlegal-body').scrollTop = document.getElementById('ezlegal-body').scrollHeight;
  }

  function showTyping() {
    var messagesEl = document.getElementById('ezlegal-messages');
    var typingEl = document.createElement('div');
    typingEl.id = 'ezlegal-typing';
    typingEl.className = 'ezlegal-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typingEl);
    document.getElementById('ezlegal-body').scrollTop = document.getElementById('ezlegal-body').scrollHeight;
  }

  function hideTyping() {
    var typingEl = document.getElementById('ezlegal-typing');
    if (typingEl) typingEl.remove();
  }

  function trackEvent(eventType, metadata) {
    fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'track', widgetId: WIDGET_ID, eventType: eventType, metadata: metadata || {}, domain: window.location.hostname, visitorId: visitorId })
    }).catch(function() {});
  }

  var badge = document.getElementById('ezlegal-badge');
  setTimeout(function() {
    if (badge && !isOpen) badge.classList.add('hidden');
  }, 8000);

  window.EZLegalWidget = {
    toggle: function() { isOpen ? this.close() : this.open(); },
    open: function() {
      isOpen = true;
      document.getElementById('ezlegal-panel').classList.add('open');
      if (badge) badge.classList.add('hidden');
      trackEvent('open');
      if (messages.length === 0) addMessage(CONFIG.behavior.greetingMessage, true);
      var input = document.getElementById('ezlegal-input');
      if (input) input.focus();
    },
    close: function() {
      isOpen = false;
      document.getElementById('ezlegal-panel').classList.remove('open');
    },
    send: function() {
      var input = document.getElementById('ezlegal-input');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage(text, false);
      trackEvent('message', { messageLength: text.length });
      showTyping();
      document.getElementById('ezlegal-send').disabled = true;
      fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', widgetId: WIDGET_ID, message: text, visitorId: visitorId, domain: window.location.hostname })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        hideTyping();
        document.getElementById('ezlegal-send').disabled = false;
        addMessage(data.response || "I apologize, but I'm having trouble responding. Please try again.", true);
      })
      .catch(function() {
        hideTyping();
        document.getElementById('ezlegal-send').disabled = false;
        addMessage("I'm sorry, there was an error. Please try again later.", true);
      });
    },
    searchLawyers: function() {
      var area = document.getElementById('ezlegal-lawyer-area').value;
      var location = document.getElementById('ezlegal-lawyer-location').value;
      if (!area) { alert('Please select a practice area'); return; }
      var resultsEl = document.getElementById('ezlegal-lawyer-results');
      var formEl = document.getElementById('ezlegal-lawyer-form');
      formEl.innerHTML = '<div class="ezlegal-analyzing"><div class="ezlegal-spinner"></div><p style="color:#64748b;">Searching for lawyers...</p></div>';
      fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lawyer_search', widgetId: WIDGET_ID, practiceArea: area, location: location, visitorId: visitorId })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.lawyers && data.lawyers.length > 0) {
          var html = '<div class="ezlegal-form-section"><h4>Matched Lawyers</h4><p>' + data.lawyers.length + ' attorneys found in your area</p>';
          data.lawyers.forEach(function(l) {
            html += '<div class="ezlegal-lawyer-card"><div class="ezlegal-lawyer-name">' + l.name + '</div><div class="ezlegal-lawyer-specialty">' + l.specialty + ' - ' + l.location + '</div><button class="ezlegal-lawyer-btn" onclick="window.open(\\'' + l.profileUrl + '\\', \\'_blank\\')">View Profile</button></div>';
          });
          html += '<button class="ezlegal-submit-btn" style="background:#64748b;margin-top:16px;" onclick="EZLegalWidget.resetLawyerSearch()">Search Again</button></div>';
          formEl.innerHTML = html;
        } else {
          formEl.innerHTML = '<div class="ezlegal-form-section"><div class="ezlegal-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg><h4>No Lawyers Found</h4><p>Try different criteria or broaden your search.</p></div><button class="ezlegal-submit-btn" onclick="EZLegalWidget.resetLawyerSearch()">Try Again</button></div>';
        }
      })
      .catch(function() {
        formEl.innerHTML = '<div class="ezlegal-form-section"><p style="color:#ef4444;text-align:center;">Error searching. Please try again.</p><button class="ezlegal-submit-btn" onclick="EZLegalWidget.resetLawyerSearch()">Try Again</button></div>';
      });
    },
    resetLawyerSearch: function() {
      document.getElementById('ezlegal-lawyer-form').innerHTML = '<h4>Find a Lawyer</h4><p>Get matched with qualified attorneys in your area.</p><div class="ezlegal-form-group"><label>Practice Area</label><select id="ezlegal-lawyer-area"><option value="">Select practice area...</option><option value="family">Family Law</option><option value="housing">Housing & Tenant Rights</option><option value="employment">Employment Law</option><option value="immigration">Immigration</option><option value="business">Business Law</option><option value="criminal">Criminal Defense</option><option value="personal_injury">Personal Injury</option><option value="estate">Estate Planning</option></select></div><div class="ezlegal-form-group"><label>Your Location</label><input type="text" id="ezlegal-lawyer-location" placeholder="City, State or ZIP code" /></div><button class="ezlegal-submit-btn" onclick="EZLegalWidget.searchLawyers()">Find Lawyers</button>';
    },
    submitContact: function() {
      var name = document.getElementById('ezlegal-contact-name').value.trim();
      var email = document.getElementById('ezlegal-contact-email').value.trim();
      var issue = document.getElementById('ezlegal-contact-issue').value;
      var message = document.getElementById('ezlegal-contact-message').value.trim();
      if (!name || !email) { alert('Please enter your name and email'); return; }
      var formEl = document.getElementById('ezlegal-contact-form');
      formEl.innerHTML = '<div class="ezlegal-analyzing"><div class="ezlegal-spinner"></div><p style="color:#64748b;">Sending...</p></div>';
      fetch(SUPABASE_URL + '/functions/v1/embed-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contact_submit', widgetId: WIDGET_ID, name: name, email: email, legalIssue: issue, message: message, visitorId: visitorId, domain: window.location.hostname })
      })
      .then(function() {
        formEl.innerHTML = '<div class="ezlegal-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><h4>Message Sent!</h4><p>Thank you! We\\'ll be in touch soon.</p></div>';
        trackEvent('contact_submitted', { email: email });
      })
      .catch(function() {
        formEl.innerHTML = '<div class="ezlegal-form-section"><p style="color:#ef4444;text-align:center;">Error sending. Please try again.</p></div>';
      });
    },
    selectFile: function(file) {
      selectedFile = file;
      document.getElementById('ezlegal-file-info').style.display = 'flex';
      document.getElementById('ezlegal-file-name').textContent = file.name;
      document.getElementById('ezlegal-analyze-btn').style.display = 'block';
    },
    analyzeDocument: function() {
      if (!selectedFile) return;
      var formEl = document.getElementById('ezlegal-doc-form');
      var resultsEl = document.getElementById('ezlegal-doc-results');
      formEl.style.display = 'none';
      resultsEl.style.display = 'block';
      resultsEl.innerHTML = '<div class="ezlegal-analyzing"><div class="ezlegal-spinner"></div><p style="color:#64748b;">Analyzing document...</p></div>';
      trackEvent('document_uploaded', { fileName: selectedFile.name, fileSize: selectedFile.size });

      var reader = new FileReader();
      reader.onload = function(e) {
        var base64Content = e.target.result.split(',')[1];
        fetch(SUPABASE_URL + '/functions/v1/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent: base64Content, fileName: selectedFile.name, source: 'embed_widget', widgetId: WIDGET_ID })
        })
        .then(function(res) {
          if (!res.ok) throw new Error('unavailable');
          return res.json();
        })
        .then(function(data) {
          if (data.analysis) {
            resultsEl.innerHTML = '<div class="ezlegal-analysis-result"><div style="padding:16px;"><p style="font-size:14px;color:#1e293b;line-height:1.6;">' + (data.analysis.summary || 'Analysis complete.') + '</p></div><div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;margin:12px 16px;"><p style="margin:0;font-size:11px;color:#92400e;">This is AI-generated analysis for informational purposes only. Not legal advice. Consult an attorney before acting on any findings.</p></div><button class="ezlegal-submit-btn" style="background:#64748b;margin:12px 16px;width:calc(100% - 32px);" onclick="EZLegalWidget.resetDocAnalysis()">Analyze Another</button></div>';
          } else {
            throw new Error('no_analysis');
          }
        })
        .catch(function() {
          resultsEl.innerHTML = '<div style="padding:24px;text-align:center;"><p style="color:#475569;font-size:14px;font-weight:500;margin:0 0 8px;">Document analysis unavailable</p><p style="color:#64748b;font-size:13px;margin:0 0 16px;">Sign in to <a href="https://ezlegal.ai" target="_blank" style="color:' + CONFIG.appearance.primaryColor + ';font-weight:500;">ezLegal.ai</a> for full document analysis.</p><button class="ezlegal-submit-btn" style="background:#64748b;" onclick="EZLegalWidget.resetDocAnalysis()">Back</button></div>';
        });
      };
      reader.readAsDataURL(selectedFile);
    },
    resetDocAnalysis: function() {
      selectedFile = null;
      document.getElementById('ezlegal-doc-form').style.display = 'block';
      document.getElementById('ezlegal-doc-results').style.display = 'none';
      document.getElementById('ezlegal-file-info').style.display = 'none';
      document.getElementById('ezlegal-analyze-btn').style.display = 'none';
      document.getElementById('ezlegal-doc-input').value = '';
    },
    predictOutcome: function() {
      var jurisdiction = document.getElementById('ezlegal-pred-jurisdiction').value;
      var category = document.getElementById('ezlegal-pred-category').value;
      var description = document.getElementById('ezlegal-pred-description').value.trim();
      if (!jurisdiction || !category) { alert('Please select jurisdiction and legal category'); return; }
      var formEl = document.getElementById('ezlegal-prediction-form');
      var resultsEl = document.getElementById('ezlegal-prediction-results');
      formEl.style.display = 'none';
      resultsEl.style.display = 'block';
      resultsEl.innerHTML = '<div class="ezlegal-analyzing"><div class="ezlegal-spinner"></div><p style="color:#64748b;">Analyzing case factors...</p></div>';
      trackEvent('prediction_requested', { jurisdiction: jurisdiction, category: category });
      fetch(SUPABASE_URL + '/functions/v1/outcome-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jurisdiction: jurisdiction,
          legalTopic: category,
          caseDescription: description,
          courtLevel: 'District',
          source: 'embed_widget',
          widgetId: WIDGET_ID
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var score = data.prediction?.favorabilityScore || data.prediction?.score || 50;
        var confidence = data.prediction?.confidenceInterval || { low: Math.max(score - 10, 0), high: Math.min(score + 10, 95) };
        var factors = data.prediction?.keyFactors || data.prediction?.factors || [];
        var scoreColor = score >= 65 ? '#22c55e' : score >= 45 ? '#eab308' : '#ef4444';
        var html = '<div class="ezlegal-analysis-result">' +
          '<div class="ezlegal-score-card" style="background:linear-gradient(135deg, ' + scoreColor + '15 0%, ' + scoreColor + '05 100%);">' +
            '<div class="ezlegal-score-value" style="color:' + scoreColor + ';">' + score + '%</div>' +
            '<div class="ezlegal-score-label">Favorable Outcome Likelihood</div>' +
            '<div style="font-size:11px;color:#64748b;margin-top:4px;">Confidence: ' + confidence.low + '% - ' + confidence.high + '%</div>' +
          '</div>' +
          '<div style="font-weight:600;color:#1e293b;margin-bottom:8px;font-size:13px;">Key Factors:</div>' +
          '<div style="margin-bottom:12px;">';
        factors.slice(0, 4).forEach(function(f) {
          var impactColor = f.impact === 'positive' ? '#22c55e' : f.impact === 'negative' ? '#ef4444' : '#64748b';
          var impactIcon = f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : '~';
          html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;">' +
            '<span style="width:18px;height:18px;border-radius:50%;background:' + impactColor + '20;color:' + impactColor + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">' + impactIcon + '</span>' +
            '<span style="font-size:12px;color:#475569;">' + f.factor + '</span>' +
          '</div>';
        });
        html += '</div>' +
          '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;margin-bottom:12px;">' +
            '<p style="margin:0;font-size:11px;color:#92400e;"><strong>Disclaimer:</strong> This is AI-generated analysis for informational purposes only. Not legal advice. Consult an attorney for your specific situation.</p>' +
          '</div>' +
          '<p style="font-size:12px;color:#64748b;text-align:center;">For detailed analysis, <a href="https://ezlegal.ai/pricing" target="_blank" style="color:' + CONFIG.appearance.primaryColor + '">create an account</a></p>' +
          '<button class="ezlegal-submit-btn" style="background:#64748b;margin-top:8px;" onclick="EZLegalWidget.resetPrediction()">New Analysis</button>' +
        '</div>';
        resultsEl.innerHTML = html;
      })
      .catch(function(err) {
        console.error('Prediction error:', err);
        resultsEl.innerHTML = '<div class="ezlegal-form-section"><p style="color:#ef4444;text-align:center;">Error analyzing case. Please try again.</p><button class="ezlegal-submit-btn" onclick="EZLegalWidget.resetPrediction()">Try Again</button></div>';
      });
    },
    resetPrediction: function() {
      document.getElementById('ezlegal-prediction-form').style.display = 'block';
      document.getElementById('ezlegal-prediction-results').style.display = 'none';
      document.getElementById('ezlegal-pred-jurisdiction').value = '';
      document.getElementById('ezlegal-pred-category').value = '';
      document.getElementById('ezlegal-pred-description').value = '';
    }
  };

  var chatInput = document.getElementById('ezlegal-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') EZLegalWidget.send(); });
  }

  trackEvent('impression');
  if (CONFIG.behavior.autoOpen) {
    setTimeout(function() { EZLegalWidget.open(); }, CONFIG.behavior.autoOpenDelay);
  }
})();
`;
}

const LEGAL_SYSTEM_PROMPT = `You are ezLegal AI, a knowledgeable and empathetic legal assistant. Your role is to provide helpful legal information to people who may not be able to afford traditional legal services.

IMPORTANT GUIDELINES:
1. Provide clear, accurate legal information while always noting you're providing information, not legal advice
2. Be empathetic and understanding - many users are dealing with stressful situations
3. Explain legal concepts in plain, accessible language
4. When relevant, mention that laws vary by state/jurisdiction
5. Suggest when someone should consult with an attorney for complex matters
6. Never encourage illegal activity or help circumvent the law
7. Be concise but thorough - aim for helpful responses under 200 words
8. If you're unsure about something, acknowledge the limitation
9. Always maintain a professional, supportive tone

You can help with topics including:
- Family law (divorce, custody, child support, adoption)
- Housing (landlord-tenant disputes, eviction, lease issues)
- Employment (wrongful termination, discrimination, wages)
- Small business (formation, contracts, compliance)
- Estate planning (wills, trusts, probate)
- Consumer rights and debt issues
- Immigration basics
- Criminal law basics

Remember: You provide legal information, NOT legal advice. No attorney-client relationship is created.`;

async function generateAIResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  openaiKey: string
): Promise<string> {
  const messages = [
    { role: "system", content: LEGAL_SYSTEM_PROMPT },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content
    })),
    { role: "user", content: message }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (req.method === "GET" && pathParts[pathParts.length - 1] === "loader.js") {
      const apiKey = url.searchParams.get("key");

      if (!apiKey) {
        return new Response("Missing API key", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      const { data: widget, error } = await supabase
        .from("embed_widgets")
        .select("*")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !widget) {
        return new Response("Widget not found or inactive", {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      const requestDomain = new URL(origin || "http://localhost").hostname;

      if (widget.allowed_domains.length > 0 && !widget.allowed_domains.includes(requestDomain) && requestDomain !== "localhost") {
        return new Response("Domain not authorized", {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" }
        });
      }

      let loaderScript: string;
      switch (widget.widget_type) {
        case 'lawyer_search':
          loaderScript = generateLawyerSearchLoader(widget, supabaseUrl);
          break;
        case 'contact_form':
          loaderScript = generateContactFormLoader(widget, supabaseUrl);
          break;
        case 'document_analyzer':
          loaderScript = generateDocumentAnalyzerLoader(widget, supabaseUrl);
          break;
        default:
          loaderScript = generateWidgetLoader(widget, supabaseUrl);
      }

      return new Response(loaderScript, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action, widgetId, message, visitorId, domain, eventType, metadata } = body;

      if (action === "track") {
        const sanitizedMetadata = { ...(metadata || {}) };
        delete sanitizedMetadata.message;
        delete sanitizedMetadata.content;
        delete sanitizedMetadata.userMessage;

        await supabase.from("widget_analytics").insert({
          widget_id: widgetId,
          event_type: eventType,
          metadata: sanitizedMetadata,
          domain: domain,
          visitor_id: visitorId
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (action === "lawyer_search") {
        const { practiceArea, location } = body;

        await supabase.from("widget_analytics").insert({
          widget_id: widgetId,
          event_type: "lawyer_search",
          metadata: { practiceArea, location },
          domain: body.domain || null,
          visitor_id: body.visitorId || null
        });

        let query = supabase
          .from("lawyer_profiles")
          .select("id, full_name, practice_areas, city, state, firm_name, is_verified")
          .eq("is_public", true)
          .limit(5);

        if (practiceArea) {
          query = query.contains("practice_areas", [practiceArea]);
        }
        if (location) {
          query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);
        }

        const { data: lawyers } = await query;

        const results = (lawyers || []).map((l) => ({
          name: l.full_name,
          specialty: Array.isArray(l.practice_areas) ? l.practice_areas[0] : "General Practice",
          location: [l.city, l.state].filter(Boolean).join(", ") || "Arizona",
          profileUrl: `https://ezlegal.ai/lawyers/${l.id}`,
          verified: l.is_verified || false,
        }));

        return new Response(JSON.stringify({
          lawyers: results,
          disclaimers: {
            general: "Attorney results are informational. Availability and fit must be confirmed.",
            referral: "Paid referrals, if any, are clearly labeled."
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (action === "contact_submit") {
        const { name, email, phone, legalIssue, message, domain: contactDomain } = body;

        await supabase.from("widget_analytics").insert({
          widget_id: widgetId,
          event_type: "contact_submitted",
          metadata: { name, email, phone, legalIssue, messageLength: message?.length },
          domain: contactDomain,
          visitor_id: body.visitorId || null
        });

        await supabase.from("widget_conversations").insert({
          widget_id: widgetId,
          visitor_id: body.visitorId || `contact_${Date.now()}`,
          visitor_email: email,
          visitor_name: name,
          messages: [{ role: "contact_form", content: message, legalIssue, phone, timestamp: new Date().toISOString() }],
          metadata: { domain: contactDomain, source: "contact_form" },
          status: "active"
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (action === "chat") {
        const { data: widget } = await supabase
          .from("embed_widgets")
          .select("*")
          .eq("id", widgetId)
          .eq("is_active", true)
          .maybeSingle();

        if (!widget) {
          return new Response(JSON.stringify({ error: "Widget not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        if (!visitorId) {
          return new Response(JSON.stringify({ error: "Visitor ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { data: conversation } = await supabase
          .from("widget_conversations")
          .select("id, messages")
          .eq("widget_id", widgetId)
          .eq("visitor_id", visitorId)
          .eq("status", "active")
          .maybeSingle();

        const openaiKey = Deno.env.get("OPENAI_API_KEY");
        let response: string;

        if (openaiKey) {
          const conversationHistory = conversation?.messages || [];
          response = await generateAIResponse(message, conversationHistory, openaiKey);
        } else {
          response = "I apologize, but the AI service is temporarily unavailable. Please try again later or contact support.";
        }

        const newMessages = conversation?.messages || [];
        newMessages.push(
          { role: "user", content: message, timestamp: new Date().toISOString() },
          { role: "assistant", content: response, timestamp: new Date().toISOString() }
        );

        if (conversation) {
          await supabase
            .from("widget_conversations")
            .update({ messages: newMessages, updated_at: new Date().toISOString() })
            .eq("id", conversation.id);
        } else {
          await supabase
            .from("widget_conversations")
            .insert({
              widget_id: widgetId,
              visitor_id: visitorId,
              messages: newMessages,
              metadata: { domain: domain }
            });
        }

        return new Response(JSON.stringify({ response }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Widget error:", error);
    return new Response(
      JSON.stringify({ error: "Widget service error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
