/**
 * Admin upload UI — calls Lab_backend /api/upload with HTTP Basic Auth.
 * Set window.__LAB_API_BASE__ in admin/index.html (no trailing slash).
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

    function wirePing() {
        var btn = document.getElementById('btnPing');
        var status = document.getElementById('status');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var base = getApiBase();
            var cred = getCredentials();
            if (!base) {
                setStatus(status, 'Set API base URL in this page (script __LAB_API_BASE__).', 'err');
                return;
            }
            if (!cred.user || !cred.pass) {
                setStatus(status, 'Enter admin username and password.', 'err');
                return;
            }

            btn.disabled = true;
            setStatus(status, 'Checking…', 'info');

            fetch(base + '/api/admin/ping', {
                method: 'GET',
                headers: { Authorization: basicAuthHeader(cred.user, cred.pass) }
            })
                .then(function (res) {
                    return res.json().then(function (body) {
                        return { ok: res.ok, status: res.status, body: body };
                    });
                })
                .then(function (r) {
                    if (r.ok) {
                        setStatus(status, 'API OK: ' + JSON.stringify(r.body), 'ok');
                    } else {
                        setStatus(status, 'Failed (' + r.status + '): ' + JSON.stringify(r.body), 'err');
                    }
                })
                .catch(function (err) {
                    setStatus(status, 'Network error: ' + err.message, 'err');
                })
                .finally(function () {
                    btn.disabled = false;
                });
        });
    }

    function wireUpload() {
        var form = document.getElementById('uploadForm');
        var status = document.getElementById('status');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var base = getApiBase();
            var cred = getCredentials();
            var fileInput = document.getElementById('file');
            var manualInput = document.getElementById('manual');
            var files = fileInput && fileInput.files;
            var manuals = manualInput && manualInput.files;

            if (!base) {
                setStatus(status, 'Set API base URL in this page.', 'err');
                return;
            }
            if (!cred.user || !cred.pass) {
                setStatus(status, 'Enter admin username and password.', 'err');
                return;
            }
            var nPic = files ? files.length : 0;
            var nPdf = manuals ? manuals.length : 0;
            if (nPic === 0 && nPdf === 0) {
                setStatus(status, 'Choose at least one picture and/or one PDF.', 'err');
                return;
            }

            var courseEl = document.getElementById('course');
            var nameEl = document.getElementById('assetName');
            var descEl = document.getElementById('assetDesc');

            var course = courseEl ? courseEl.value : '';
            var assetName = nameEl ? nameEl.value.trim() : '';
            var assetDesc = descEl ? descEl.value.trim() : '';

            if (!course) {
                setStatus(status, 'Select a course.', 'err');
                return;
            }
            if (!assetName) {
                setStatus(status, 'Enter a Lab Activity name.', 'err');
                return;
            }

            var slotId = course + ':new_row';

            var fd = new FormData();
            for (var fi = 0; fi < files.length; fi++) {
                fd.append('file', files[fi]);
            }
            fd.append('slotId', slotId);
            fd.append('name', assetName);
            fd.append('alt', assetName);
            if (assetDesc) fd.append('description', assetDesc);

            var submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            setStatus(
                status,
                'Uploading ' + nPic + ' picture(s), ' + nPdf + ' PDF(s)… (slot: ' + slotId + ')',
                'info'
            );

            fetch(base + '/api/upload', {
                method: 'POST',
                headers: { Authorization: basicAuthHeader(cred.user, cred.pass) },
                body: fd
            })
                .then(function (res) {
                    return res.json().then(function (body) {
                        return { ok: res.ok, status: res.status, body: body };
                    }).catch(function () {
                        return { ok: res.ok, status: res.status, body: {} };
                    });
                })
                .then(function (r) {
                    if (r.ok) {
                        var msg =
                            'Uploaded ' +
                            (r.body.filesUploaded != null ? r.body.filesUploaded : nPic) +
                            ' picture(s), ' +
                            (r.body.manualsUploaded != null ? r.body.manualsUploaded : nPdf) +
                            ' PDF(s)!';
                        msg += '\nSlot: ' + (r.body.slotId || slotId);
                        if (r.body.totalFilesInRow != null) {
                            msg += '\nPictures in row: ' + r.body.totalFilesInRow;
                        }
                        if (r.body.totalManualsInRow != null) {
                            msg += '\nManuals in row: ' + r.body.totalManualsInRow;
                        }
                        if (r.body.keys && r.body.keys.length) {
                            msg += '\nPicture keys: ' + r.body.keys.join(', ');
                        }
                        if (r.body.manualKeys && r.body.manualKeys.length) {
                            msg += '\nPDF keys: ' + r.body.manualKeys.join(', ');
                        } else if (r.body.key) {
                            msg += '\nKey: ' + r.body.key;
                        }
                        if (r.body.url) msg += '\nFirst URL: ' + r.body.url;
                        setStatus(status, msg, 'ok');
                    } else {
                        setStatus(status, 'Upload failed (' + r.status + '): ' + JSON.stringify(r.body), 'err');
                    }
                })
                .catch(function (err) {
                    setStatus(status, 'Network error: ' + err.message, 'err');
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        wirePing();
        wireUpload();
    });
})();
