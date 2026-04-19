/**
 * Shared helpers for admin pages (upload + load list).
 * Requires window.__LAB_API_BASE__ set in admin/index.html.
 */
(function () {
    'use strict';

    function getApiBase() {
        var base = typeof window.__LAB_API_BASE__ === 'string' ? window.__LAB_API_BASE__.trim() : '';
        if (!base) {
            console.warn('Set window.__LAB_API_BASE__ in admin/index.html.');
            return '';
        }
        return base.replace(/\/$/, '');
    }

    function basicAuthHeader(username, password) {
        var combined = new TextEncoder().encode(username + ':' + password);
        var binary = '';
        combined.forEach(function (b) {
            binary += String.fromCharCode(b);
        });
        return 'Basic ' + btoa(binary);
    }

    function getCredentials() {
        var user = (document.getElementById('adminUser') || {}).value;
        var pass = (document.getElementById('adminPass') || {}).value;
        return {
            user: (user || '').trim(),
            pass: pass || ''
        };
    }

    function setStatus(el, message, kind) {
        if (!el) return;
        el.textContent = message;
        el.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-info');
        el.classList.add('alert');
        if (kind === 'err') el.classList.add('alert-danger');
        else if (kind === 'info') el.classList.add('alert-info');
        else el.classList.add('alert-success');
        if (message) el.classList.remove('d-none');
    }

    window.LabAdmin = {
        getApiBase: getApiBase,
        basicAuthHeader: basicAuthHeader,
        getCredentials: getCredentials,
        setStatus: setStatus
    };

    document.addEventListener('DOMContentLoaded', function () {
        var pwd = document.getElementById('adminPass');
        var btn = document.getElementById('adminPassToggle');
        var icon = document.getElementById('adminPassToggleIcon');
        if (!pwd || !btn || !icon) return;
        btn.addEventListener('click', function () {
            var visible = pwd.type === 'text';
            pwd.type = visible ? 'password' : 'text';
            icon.classList.toggle('bi-eye', visible);
            icon.classList.toggle('bi-eye-slash', !visible);
            var show = visible;
            btn.setAttribute('aria-pressed', show ? 'false' : 'true');
            btn.setAttribute('aria-label', show ? 'Show password' : 'Hide password');
            btn.setAttribute('title', show ? 'Show password' : 'Hide password');
        });
    });
})();
