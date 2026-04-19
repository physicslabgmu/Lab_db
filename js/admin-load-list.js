/**
 * Load list: fetch manifest, show all *:new_rows in a table by subject (course).
 * Delete uses /api/admin/delete-attachment with Basic Auth.
 */
(function () {
    'use strict';

    var A = window.LabAdmin;
    if (!A) {
        console.error('admin-common.js must load before admin-load-list.js');
        return;
    }

    var COURSE_LABELS = {
        phy103: 'PHY 103',
        phy104: 'PHY 104',
        phy161: 'PHY 161',
        phy244: 'PHY 244',
        phy246: 'PHY 246',
        phy261: 'PHY 261',
        phy263: 'PHY 263',
        phy311: 'PHY 311',
        phy312: 'PHY 312'
    };

    function courseDisplayName(slug) {
        var s = (slug || '').toLowerCase();
        if (COURSE_LABELS[s]) return COURSE_LABELS[s];
        return s ? s.toUpperCase() : '—';
    }

    function parseIsoTime(value) {
        var t = Date.parse(value || '');
        return isNaN(t) ? 0 : t;
    }

    function normalizeFiles(entry) {
        if (entry && Array.isArray(entry.files) && entry.files.length) return entry.files.slice();
        if (entry && entry.url && entry.key) {
            return [
                {
                    url: entry.url,
                    key: entry.key,
                    fileName: entry.fileName,
                    addedAt: entry.addedAt
                }
            ];
        }
        return [];
    }

    function normalizeManuals(entry) {
        if (entry && Array.isArray(entry.manuals) && entry.manuals.length) return entry.manuals.slice();
        return [];
    }

    function clearNode(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    function appendText(el, text) {
        if (!el) return;
        el.appendChild(document.createTextNode(text));
    }

    /**
     * Flatten manifest into rows with course slug + activity entry.
     */
    function collectAllNewRowActivities(manifest) {
        var out = [];
        if (!manifest || typeof manifest !== 'object') return out;

        for (var key in manifest) {
            if (!Object.prototype.hasOwnProperty.call(manifest, key)) continue;
            if (!/:new_rows$/.test(key)) continue;
            var courseSlug = key.replace(/:new_rows$/, '');
            var arr = manifest[key];
            if (!Array.isArray(arr)) continue;
            for (var i = 0; i < arr.length; i++) {
                out.push({ courseSlug: courseSlug, entry: arr[i] || {} });
            }
        }

        out.sort(function (a, b) {
            if (a.courseSlug !== b.courseSlug) {
                return a.courseSlug < b.courseSlug ? -1 : 1;
            }
            var na = (a.entry.name || '').trim();
            var nb = (b.entry.name || '').trim();
            if (na !== nb) return na < nb ? -1 : 1;
            return 0;
        });
        return out;
    }

    function fillAttachmentCell(td, items, courseSlug, listName) {
        if (!items.length) {
            td.className = 'text-muted small';
            appendText(td, '—');
            return;
        }
        for (var i = 0; i < items.length; i++) {
            var item = items[i] || {};
            if (!item.key) continue;
            var row = document.createElement('div');
            row.className = 'd-flex align-items-center justify-content-between gap-2 mb-1';

            var left = document.createElement('div');
            left.className = 'small text-break';
            if (item.url) {
                var link = document.createElement('a');
                link.href = item.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                appendText(link, item.fileName || item.key);
                left.appendChild(link);
            } else {
                appendText(left, item.fileName || item.key);
            }
            row.appendChild(left);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline-danger btn-sm flex-shrink-0';
            appendText(btn, 'Delete');
            btn.dataset.key = item.key;
            btn.dataset.list = listName;
            btn.dataset.course = courseSlug;
            btn.dataset.fileName = item.fileName || item.key;
            row.appendChild(btn);

            td.appendChild(row);
        }
    }

    function renderUploadsTable(manifest) {
        var listHost = document.getElementById('manageList');
        if (!listHost) return;
        clearNode(listHost);

        var flat = collectAllNewRowActivities(manifest);
        var tbodyRows = [];

        for (var j = 0; j < flat.length; j++) {
            var pack = flat[j];
            var entry = pack.entry;
            var courseSlug = pack.courseSlug;

            var files = normalizeFiles(entry).sort(function (a, b) {
                return parseIsoTime(b && b.addedAt) - parseIsoTime(a && a.addedAt);
            });
            var manuals = normalizeManuals(entry).sort(function (a, b) {
                return parseIsoTime(b && b.addedAt) - parseIsoTime(a && a.addedAt);
            });
            if (!files.length && !manuals.length) continue;

            var tr = document.createElement('tr');

            var tdCourse = document.createElement('td');
            tdCourse.className = 'course-cell';
            var badge = document.createElement('span');
            badge.className = 'subject-badge';
            badge.title = courseSlug;
            appendText(badge, courseDisplayName(courseSlug));
            tdCourse.appendChild(badge);
            var slugSmall = document.createElement('div');
            slugSmall.className = 'text-muted small';
            appendText(slugSmall, courseSlug);
            tdCourse.appendChild(slugSmall);
            tr.appendChild(tdCourse);

            var tdName = document.createElement('td');
            appendText(tdName, (entry.name || '').trim() || '(no name)');
            tr.appendChild(tdName);

            var tdPic = document.createElement('td');
            fillAttachmentCell(tdPic, files, courseSlug, 'files');
            tr.appendChild(tdPic);

            var tdMan = document.createElement('td');
            fillAttachmentCell(tdMan, manuals, courseSlug, 'manuals');
            tr.appendChild(tdMan);

            tbodyRows.push(tr);
        }

        if (!tbodyRows.length) {
            listHost.className = 'manage-list hint p-3';
            appendText(listHost, 'No dynamic rows in the manifest (nothing under any *:new_rows).');
            return;
        }

        listHost.className = 'manage-list p-0';
        var wrap = document.createElement('div');
        wrap.className = 'table-responsive';

        var table = document.createElement('table');
        table.className = 'table table-sm table-striped table-bordered align-middle mb-0';

        var thead = document.createElement('thead');
        thead.className = 'table-light';
        var hr = document.createElement('tr');
        ['Subject', 'Lab activity', 'Pictures', 'Lab manuals'].forEach(function (label) {
            var th = document.createElement('th');
            th.scope = 'col';
            if (label === 'Subject') th.style.minWidth = '8rem';
            appendText(th, label);
            hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        for (var t = 0; t < tbodyRows.length; t++) {
            tbody.appendChild(tbodyRows[t]);
        }
        table.appendChild(tbody);

        wrap.appendChild(table);
        listHost.appendChild(wrap);
    }

    function loadAllUploadsFromManifest() {
        var base = A.getApiBase();
        var status = document.getElementById('status');
        var listHost = document.getElementById('manageList');
        if (!listHost) return Promise.resolve();

        if (!base) {
            listHost.className = 'manage-list hint p-2';
            listHost.textContent = 'Set API base URL in this page.';
            return Promise.resolve();
        }

        listHost.className = 'manage-list hint p-2';
        listHost.textContent = 'Loading uploads…';

        return fetch(base + '/api/public/asset-slots', {
            method: 'GET',
            cache: 'no-store'
        })
            .then(function (res) {
                return res.json().then(function (body) {
                    return { ok: res.ok, status: res.status, body: body };
                }).catch(function () {
                    return { ok: res.ok, status: res.status, body: {} };
                });
            })
            .then(function (r) {
                if (!r.ok) {
                    listHost.textContent = '';
                    A.setStatus(status, 'Failed to load uploads (' + r.status + ').', 'err');
                    return;
                }
                renderUploadsTable(r.body);
            })
            .catch(function (err) {
                listHost.textContent = '';
                A.setStatus(status, 'Network error while loading uploads: ' + err.message, 'err');
            });
    }

    function deleteAttachment(btn) {
        var base = A.getApiBase();
        var status = document.getElementById('status');
        var cred = A.getCredentials();
        var key = btn && btn.dataset ? btn.dataset.key : '';
        var listName = btn && btn.dataset ? btn.dataset.list : '';
        var course = btn && btn.dataset ? btn.dataset.course : '';
        var fileName = btn && btn.dataset ? btn.dataset.fileName : '';

        if (!base) {
            A.setStatus(status, 'Set API base URL in this page.', 'err');
            return;
        }
        if (!cred.user || !cred.pass) {
            A.setStatus(status, 'Enter admin username and password.', 'err');
            return;
        }
        if (!course || !key || !listName) {
            A.setStatus(status, 'Missing delete details. Reload list and try again.', 'err');
            return;
        }
        if (!window.confirm('Delete ' + (fileName || key) + '? This cannot be undone.')) {
            return;
        }

        btn.disabled = true;
        A.setStatus(status, 'Deleting ' + (fileName || key) + '…', 'info');

        fetch(base + '/api/admin/delete-attachment', {
            method: 'POST',
            headers: {
                Authorization: A.basicAuthHeader(cred.user, cred.pass),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                course: course,
                key: key,
                list: listName
            })
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
                    A.setStatus(status, 'Deleted: ' + (fileName || key), 'ok');
                    return loadAllUploadsFromManifest();
                }
                btn.disabled = false;
                A.setStatus(
                    status,
                    'Delete failed (' +
                        r.status +
                        '): ' +
                        (r.body && (r.body.error || r.body.details || JSON.stringify(r.body))),
                    'err'
                );
            })
            .catch(function (err) {
                btn.disabled = false;
                A.setStatus(status, 'Network error while deleting: ' + err.message, 'err');
            });
    }

    function wireLoadList() {
        var loadBtn = document.getElementById('btnLoadUploads');
        var listHost = document.getElementById('manageList');
        if (!listHost) return;

        if (loadBtn) {
            loadBtn.addEventListener('click', function () {
                loadAllUploadsFromManifest();
            });
        }

        listHost.addEventListener('click', function (e) {
            var b = e.target && e.target.closest ? e.target.closest('button[data-key][data-list]') : null;
            if (!b) return;
            deleteAttachment(b);
        });
    }

    window.refreshAdminUploadList = loadAllUploadsFromManifest;

    document.addEventListener('DOMContentLoaded', function () {
        wireLoadList();
    });
})();
