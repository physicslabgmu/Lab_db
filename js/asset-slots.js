/**
 * asset-slots.js — Fetches the slot manifest from the API and fills
 * Pictures (Photo) cells with a link to the file; link text is the
 * uploaded filename when present in the manifest.
 *
 * Slot key convention:  {pageSlug}:equip_{rowId}
 *   pageSlug = filename without .html, e.g. "phy246_electricfieldmapping"
 *   rowId    = value in the first <td> of each table row (1, 2, 3…)
 *
 * Include this script before </body> on every lab detail page:
 *   <script src="../js/asset-slots.js"></script>
 */
(function () {
    'use strict';

    var h = window.location.hostname;
    var API_BASE = (h === 'localhost' || h === '127.0.0.1')
        ? 'http://localhost:3000'
        : 'https://lab-backend-nwko.onrender.com';

    function getPageSlug() {
        var p = window.location.pathname;
        var file = p.split('/').pop() || '';
        return file.replace(/\.html?$/i, '');
    }

    function pictureLinkLabel(fileOrSlot) {
        var fn = (fileOrSlot.fileName || '').trim();
        if (fn) return fn;
        if (fileOrSlot.key) {
            var base = fileOrSlot.key.split('/').pop() || '';
            var stripped = base.replace(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
                ''
            );
            if (stripped) return stripped;
        }
        return fileOrSlot.name || 'File';
    }

    function slotFileList(slot) {
        if (Array.isArray(slot.files) && slot.files.length) {
            return slot.files.filter(function (f) {
                return f && f.url;
            });
        }
        if (slot.url) {
            return [
                {
                    url: slot.url,
                    key: slot.key,
                    fileName: slot.fileName,
                },
            ];
        }
        return [];
    }

    function slotManualList(slot) {
        if (Array.isArray(slot.manuals) && slot.manuals.length) {
            return slot.manuals.filter(function (f) {
                return f && f.url;
            });
        }
        return [];
    }

    function appendFileLinksToCell(cell, files, titleBase) {
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (!f.url) continue;
            var wrap = document.createElement('div');
            wrap.style.marginBottom = '0.35em';
            var link = document.createElement('a');
            link.href = f.url;
            link.target = '_blank';
            link.textContent = pictureLinkLabel(f);
            link.title = titleBase || pictureLinkLabel(f);
            wrap.appendChild(link);
            cell.appendChild(wrap);
        }
    }

    function findPhotoColIndex(table) {
        var ths = table.querySelectorAll('tr:first-child th, thead tr th');
        for (var i = 0; i < ths.length; i++) {
            if (/photo|pictures/i.test(ths[i].textContent)) return i;
        }
        return -1;
    }

    function findManualColIndex(table) {
        var ths = table.querySelectorAll('tr:first-child th, thead tr th');
        for (var i = 0; i < ths.length; i++) {
            if (/manual/i.test(ths[i].textContent)) return i;
        }
        return -1;
    }

    function applySlots(slots, slug, table, colIdx) {
        var manualColIdx = findManualColIndex(table);
        var rows = table.querySelectorAll('tr');
        for (var r = 1; r < rows.length; r++) {
            var cells = rows[r].querySelectorAll('td');
            if (!cells.length || colIdx >= cells.length) continue;

            var rowId = (cells[0].textContent || '').trim();
            if (!rowId) continue;

            var key = slug + ':equip_' + rowId;
            var slot = slots[key];
            var fileList = slot ? slotFileList(slot) : [];
            var manualList = slot ? slotManualList(slot) : [];
            if (!slot || (!fileList.length && !manualList.length)) continue;

            var titleBase = slot.name || '';

            var photoCell = cells[colIdx];
            photoCell.innerHTML = '';
            if (fileList.length) {
                appendFileLinksToCell(photoCell, fileList, titleBase);
                if (slot.description) {
                    var cap = document.createElement('div');
                    cap.style.fontSize = '0.8em';
                    cap.style.color = '#555';
                    cap.style.marginTop = '0.35em';
                    cap.textContent = slot.description;
                    photoCell.appendChild(cap);
                }
            } else if (slot.description) {
                var capOnly = document.createElement('div');
                capOnly.style.fontSize = '0.8em';
                capOnly.style.color = '#555';
                capOnly.textContent = slot.description;
                photoCell.appendChild(capOnly);
            }

            if (manualColIdx >= 0 && manualColIdx < cells.length && manualList.length) {
                var manCell = cells[manualColIdx];
                manCell.innerHTML = '';
                appendFileLinksToCell(manCell, manualList, titleBase);
            }
        }
    }

    function appendNewRows(slots, slug, table, colIdx) {
        var arr = slots[slug + ':new_rows'];
        if (!arr || !arr.length) return;

        var resolvedPhoto = findPhotoColIndex(table);
        var photoIdx = resolvedPhoto >= 0 ? resolvedPhoto : colIdx;
        var manualIdx = findManualColIndex(table);
        if (manualIdx < 0 && photoIdx >= 0) {
            manualIdx = photoIdx + 1;
        }

        var tbody = table.querySelector('tbody') || table;
        var existingRows = tbody.querySelectorAll('tr');
        var lastId = 0;
        for (var r = existingRows.length - 1; r >= 0; r--) {
            var firstTd = existingRows[r].querySelector('td');
            if (firstTd) {
                var parsed = parseInt(firstTd.textContent, 10);
                if (!isNaN(parsed) && parsed > lastId) { lastId = parsed; break; }
            }
        }

        var totalCols = 0;
        var headerRow = table.querySelector('thead tr, tr:first-child');
        if (headerRow) totalCols = headerRow.querySelectorAll('th, td').length;
        if (totalCols < 3) totalCols = 5;

        for (var n = 0; n < arr.length; n++) {
            var entry = arr[n];
            var files = slotFileList(entry);
            var manuals = slotManualList(entry);
            if (!files.length && !manuals.length && !entry.name && !entry.description) continue;

            var newId = lastId + 1 + n;
            var tr = document.createElement('tr');

            for (var c = 0; c < totalCols; c++) {
                if (c === 0) {
                    var tdId = document.createElement('td');
                    tdId.textContent = newId;
                    tr.appendChild(tdId);
                } else if (c === 1) {
                    var tdName = document.createElement('td');
                    tdName.textContent = entry.name || '';
                    tr.appendChild(tdName);
                } else if (c === photoIdx) {
                    var tdPic = document.createElement('td');
                    if (files.length) {
                        appendFileLinksToCell(tdPic, files, entry.name || '');
                        if (entry.description) {
                            var cap = document.createElement('div');
                            cap.style.fontSize = '0.8em';
                            cap.style.color = '#555';
                            cap.style.marginTop = '0.35em';
                            cap.textContent = entry.description;
                            tdPic.appendChild(cap);
                        }
                    } else if (entry.description) {
                        var cap2 = document.createElement('div');
                        cap2.style.fontSize = '0.8em';
                        cap2.style.color = '#555';
                        cap2.textContent = entry.description;
                        tdPic.appendChild(cap2);
                    }
                    tr.appendChild(tdPic);
                } else if (c === manualIdx) {
                    var tdMan = document.createElement('td');
                    if (manuals.length) {
                        appendFileLinksToCell(tdMan, manuals, entry.name || '');
                    }
                    tr.appendChild(tdMan);
                } else {
                    tr.appendChild(document.createElement('td'));
                }
            }

            tbody.appendChild(tr);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var slug = getPageSlug();
        if (!slug) return;

        var tables = document.querySelectorAll('table');
        if (!tables.length) return;

        var targets = [];
        for (var t = 0; t < tables.length; t++) {
            var idx = findPhotoColIndex(tables[t]);
            if (idx >= 0) targets.push({ table: tables[t], colIdx: idx });
        }
        if (!targets.length) return;

        fetch(API_BASE + '/api/public/asset-slots')
            .then(function (res) { return res.json(); })
            .then(function (slots) {
                for (var i = 0; i < targets.length; i++) {
                    applySlots(slots, slug, targets[i].table, targets[i].colIdx);
                    appendNewRows(slots, slug, targets[i].table, targets[i].colIdx);
                }
            })
            .catch(function (err) {
                console.warn('asset-slots: could not load manifest', err.message);
            });
    });
})();
