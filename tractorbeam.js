var TractorBeam = (function () {
'use strict';

// src/event-emitter.coffee
var EventEmitter;
var slice = [].slice;

var EventEmitter$1 = EventEmitter = (function() {
  function EventEmitter(opts) {
    var ref;
    if (opts == null) {
      opts = {};
    }
    this.debug = (ref = opts.debug) != null ? ref : false;
    this._listeners = {};
    this._allListeners = [];
  }

  EventEmitter.prototype.on = function(event, callback) {
    var base;
    if (event) {
      if ((base = this._listeners)[event] == null) {
        base[event] = [];
      }
      this._listeners[event].push(callback);
      return this._listeners[event].length - 1;
    } else {
      this._allListeners.push(callback);
      return this._allListeners.length - 1;
    }
  };

  EventEmitter.prototype.off = function(event, index) {
    if (!event) {
      return this._listeners = {};
    }
    if (index != null) {
      this._listeners[event][index] = null;
    } else {
      this._listeners[event] = {};
    }
  };

  EventEmitter.prototype.emit = function() {
    var args, event, i, j, len, len1, listener, listeners, ref;
    event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    listeners = this._listeners[event] || [];
    for (i = 0, len = listeners.length; i < len; i++) {
      listener = listeners[i];
      if (listener != null) {
        listener.apply(this, args);
      }
    }
    args.unshift(event);
    ref = this._allListeners;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      listener = ref[j];
      listener.apply(this, args);
    }
    if (this.debug) {
      return console.log.apply(console, args);
    }
  };

  return EventEmitter;

})();

//  commonjsHelpers







function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var uppie = createCommonjsModule(function (module, exports) {
// node_modules/uppie/uppie.js
/*! uppie v1.0.4 | (c) silverwind | BSD license */
(function(m) {
  module.exports = m();
})(function() {
  "use strict";
  return function Uppie() {
    return function(node, cb) {
      if (node instanceof NodeList) {
        [].slice.call(node).forEach(function(n) {
          watch(n, cb);
        });
      } else {
        watch(node, cb);
      }
    };
  };

  function watch(node, cb) {
    if (node.tagName.toLowerCase() === "input" && node.type === "file") {
      node.addEventListener("change", function(event) {
        var t = event.target;
        if (t.files && t.files.length) {
          arrayApi(t, cb.bind(null, event));
        } else if ("getFilesAndDirectories" in t) {
          newDirectoryApi(t, cb.bind(null, event));
        } else {
          cb(event);
        }
      });
    } else {
      var stop = function(event) { event.preventDefault(); };
      node.addEventListener("dragover", stop);
      node.addEventListener("dragenter", stop);
      node.addEventListener("drop", function(event) {
        event.preventDefault();
        var dt = event.dataTransfer;
        if (dt.items && dt.items.length && "webkitGetAsEntry" in dt.items[0]) {
          entriesApi(dt.items, cb.bind(null, event));
        } else if ("getFilesAndDirectories" in dt) {
          newDirectoryApi(dt, cb.bind(null, event));
        } else if (dt.files) {
          arrayApi(dt, cb.bind(null, event));
        } else cb();
      });
    }
  }

  // API implemented in Firefox 42+ and Edge
  function newDirectoryApi(input, cb) {
    var fd = new FormData(), files = [];
    var iterate = function(entries, path, resolve) {
      var promises = [];
      entries.forEach(function(entry) {
        promises.push(new Promise(function(resolve) {
          if ("getFilesAndDirectories" in entry) {
            entry.getFilesAndDirectories().then(function(entries) {
              iterate(entries, entry.path + "/", resolve);
            });
          } else {
            if (entry.name) {
              var p = (path + entry.name).replace(/^[/\\]/, "");
              fd.append("files[]", entry, p);
              files.push(p);
            }
            resolve();
          }
        }));
      });
      Promise.all(promises).then(resolve);
    };
    input.getFilesAndDirectories().then(function(entries) {
      new Promise(function(resolve) {
        iterate(entries, "/", resolve);
      }).then(cb.bind(null, fd, files));
    });
  }

  // old prefixed API implemented in Chrome 11+ as well as array fallback
  function arrayApi(input, cb) {
    var fd = new FormData(), files = [];
    [].slice.call(input.files).forEach(function(file) {
      fd.append("files[]", file, file.webkitRelativePath || file.name);
      files.push(file.webkitRelativePath || file.name);
    });
    cb(fd, files);
  }

  // old drag and drop API implemented in Chrome 11+
  function entriesApi(items, cb) {
    var fd = new FormData(), files = [], rootPromises = [];

    function readEntries(entry, reader, oldEntries, cb) {
      var dirReader = reader || entry.createReader();
      dirReader.readEntries(function(entries) {
        var newEntries = oldEntries ? oldEntries.concat(entries) : entries;
        if (entries.length) {
          setTimeout(readEntries.bind(null, entry, dirReader, newEntries, cb), 0);
        } else {
          cb(newEntries);
        }
      });
    }

    function readDirectory(entry, path, resolve) {
      if (!path) path = entry.name;
      readEntries(entry, 0, 0, function(entries) {
        var promises = [];
        entries.forEach(function(entry) {
          promises.push(new Promise(function(resolve) {
            if (entry.isFile) {
              entry.file(function(file) {
                var p = path + "/" + file.name;
                fd.append("files[]", file, p);
                files.push(p);
                resolve();
              }, resolve.bind());
            } else readDirectory(entry, path + "/" + entry.name, resolve);
          }));
        });
        Promise.all(promises).then(resolve.bind());
      });
    }

    [].slice.call(items).forEach(function(entry) {
      entry = entry.webkitGetAsEntry();
      if (entry) {
        rootPromises.push(new Promise(function(resolve) {
          if (entry.isFile) {
            entry.file(function(file) {
              fd.append("files[]", file, file.name);
              files.push(file.name);
              resolve();
            }, resolve.bind());
          } else if (entry.isDirectory) {
            readDirectory(entry, null, resolve);
          }
        }));
      }
    });
    Promise.all(rootPromises).then(cb.bind(null, fd, files));
  }
});
});

// src/polyfill.js
// Directory Upload Proposal Polyfill: https://raw.githubusercontent.com/WICG/directory-upload/gh-pages/polyfill.js
function directoryUploadPolyfill() {
	// Do not proceed with the polyfill if Directory interface is already natively available,
	// or if webkitdirectory is not supported (i.e. not Chrome, since the polyfill only works in Chrome)
	if (window.Directory || !('webkitdirectory' in document.createElement('input') && 'webkitGetAsEntry' in DataTransferItem.prototype)) {
		return;
	}

	var allowdirsAttr = 'allowdirs',
		getFilesMethod = 'getFilesAndDirectories',
		isSupportedProp = 'isFilesAndDirectoriesSupported',
		chooseDirMethod = 'chooseDirectory';

	var separator = '/';

	var Directory = function() {
		this.name = '';
		this.path = separator;
		this._children = {};
		this._items = false;
	};

	Directory.prototype[getFilesMethod] = function() {
		var that = this;

		// from drag and drop and file input drag and drop (webkitEntries)
		if (this._items) {
			var getItem = function(entry) {
				if (entry.isDirectory) {
					var dir = new Directory();
					dir.name = entry.name;
					dir.path = entry.fullPath;
					dir._items = entry;

					return dir;
				} else {
					return new Promise(function(resolve, reject) {
						entry.file(function(file) {
							resolve(file);
						}, reject);
					});
				}
			};

			if (this.path === separator) {
				var promises = [];

				for (var i = 0; i < this._items.length; i++) {
					var entry;

					// from file input drag and drop (webkitEntries)
					if (this._items[i].isDirectory || this._items[i].isFile) {
						entry = this._items[i];
					} else {
						entry = this._items[i].webkitGetAsEntry();
					}

					promises.push(getItem(entry));
				}

				return Promise.all(promises);
			} else {
				return new Promise(function(resolve, reject) {
					var dirReader = that._items.createReader();
					var promises = [];

					var readEntries = function() {
						dirReader.readEntries(function(entries) {
							if (!entries.length) {
								resolve(Promise.all(promises));
							} else {
								for (var i = 0; i < entries.length; i++) {
									promises.push(getItem(entries[i]));
								}

								readEntries();
							}
						}, reject);
					};

					readEntries();
				});
			}
		// from file input manual selection
		} else {
			var arr = [];

			for (var child in this._children) {
				arr.push(this._children[child]);
			}

			return Promise.resolve(arr);
		}
	};

	// set blank as default for all inputs
	HTMLInputElement.prototype[getFilesMethod] = function() {
		return Promise.resolve([]);
	};

	// if OS is Mac, the combined directory and file picker is supported
	HTMLInputElement.prototype[isSupportedProp] = navigator.appVersion.indexOf("Mac") !== -1;

	HTMLInputElement.prototype[allowdirsAttr] = undefined;
	HTMLInputElement.prototype[chooseDirMethod] = undefined;

	// expose Directory interface to window
	window.Directory = Directory;

	/********************
	 **** File Input ****
	 ********************/
	var convertInputs = function(nodes) {
		var recurse = function(dir, path, fullPath, file) {
			var pathPieces = path.split(separator);
			var dirName = pathPieces.shift();

			if (pathPieces.length > 0) {
				var subDir = new Directory();
				subDir.name = dirName;
				subDir.path = separator + fullPath;

				if (!dir._children[subDir.name]) {
					dir._children[subDir.name] = subDir;
				}

				recurse(dir._children[subDir.name], pathPieces.join(separator), fullPath, file);
			} else {
				dir._children[file.name] = file;
			}
		};

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];

			if (node.tagName === 'INPUT' && node.type === 'file') {
				var getFiles = function() {
					var files = node.files;

					if (draggedAndDropped) {
						files = node.webkitEntries;
						draggedAndDropped = false;
					} else {
						if (files.length === 0) {
							files = node.shadowRoot.querySelector('#input1').files;

							if (files.length === 0) {
								files = node.shadowRoot.querySelector('#input2').files;

								if (files.length === 0) {
									files = node.webkitEntries;
								}
							}
						}
					}

					return files;
				};

				var draggedAndDropped = false;

				node.addEventListener('drop', function(e) {
					draggedAndDropped = true;
				}, false);

				if (node.hasAttribute(allowdirsAttr)) {
					// force multiple selection for default behavior
					if (!node.hasAttribute('multiple')) {
						node.setAttribute('multiple', '');
					}

					var shadow = node.createShadowRoot();

					node[chooseDirMethod] = function() {
						// can't do this without an actual click
						console.log('This is unsupported. For security reasons the dialog cannot be triggered unless it is a response to some user triggered event such as a click on some other element.');
					};

					shadow.innerHTML = '<div style="border: 1px solid #999; padding: 3px; width: 235px; box-sizing: content-box; font-size: 14px; height: 21px;">'
						+ '<div id="fileButtons" style="box-sizing: content-box;">'
						+ '<button id="button1" style="width: 100px; box-sizing: content-box;">Choose file(s)...</button>'
						+ '<button id="button2" style="width: 100px; box-sizing: content-box; margin-left: 3px;">Choose folder...</button>'
						+ '</div>'
						+ '<div id="filesChosen" style="padding: 3px; display: none; box-sizing: content-box;"><span id="filesChosenText">files selected...</span>'
						+ '<a id="clear" title="Clear selection" href="javascript:;" style="text-decoration: none; float: right; margin: -3px -1px 0 0; padding: 3px; font-weight: bold; font-size: 16px; color:#999; box-sizing: content-box;">&times;</a>'
						+ '</div>'
						+ '</div>'
						+ '<input id="input1" type="file" multiple style="display: none;">'
						+ '<input id="input2" type="file" webkitdirectory style="display: none;">'
						+ '</div>';

					shadow.querySelector('#button1').onclick = function(e) {
						e.preventDefault();

						shadow.querySelector('#input1').click();
					};

					shadow.querySelector('#button2').onclick = function(e) {
						e.preventDefault();

						shadow.querySelector('#input2').click();
					};

					var toggleView = function(defaultView, filesLength) {
						shadow.querySelector('#fileButtons').style.display = defaultView ? 'block' : 'none';
						shadow.querySelector('#filesChosen').style.display = defaultView ? 'none' : 'block';

						if (!defaultView) {
							shadow.querySelector('#filesChosenText').innerText = filesLength + ' file' + (filesLength > 1 ? 's' : '') + ' selected...';
						}
					};

					var changeHandler = function(e) {
						node.dispatchEvent(new Event('change'));

						toggleView(false, getFiles().length);
					};

					shadow.querySelector('#input1').onchange = shadow.querySelector('#input2').onchange = changeHandler;

					var clear = function (e) {
						toggleView(true);

						var form = document.createElement('form');
						node.parentNode.insertBefore(form, node);
						node.parentNode.removeChild(node);
						form.appendChild(node);
						form.reset();

						form.parentNode.insertBefore(node, form);
						form.parentNode.removeChild(form);

						// reset does not instantly occur, need to give it some time
						setTimeout(function() {
							node.dispatchEvent(new Event('change'));
						}, 1);
					};

					shadow.querySelector('#clear').onclick = clear;
				}

				node.addEventListener('change', function() {
					var dir = new Directory();

					var files = getFiles();

					if (files.length > 0) {
						if (node.hasAttribute(allowdirsAttr)) {
							toggleView(false, files.length);
						}

						// from file input drag and drop (webkitEntries)
						if (files[0].isFile || files[0].isDirectory) {
							dir._items = files;
						} else {
							for (var j = 0; j < files.length; j++) {
								var file = files[j];
								var path = file.webkitRelativePath;
								var fullPath = path.substring(0, path.lastIndexOf(separator));

								recurse(dir, path, fullPath, file);
							}
						}
					} else if (node.hasAttribute(allowdirsAttr)) {
						toggleView(true, files.length);
					}

					this[getFilesMethod] = function() {
						return dir[getFilesMethod]();
					};
				});
			}
		}
	};

	// polyfill file inputs when the DOM loads
	document.addEventListener('DOMContentLoaded', function(event) {
		convertInputs(document.getElementsByTagName('input'));
	});

	// polyfill file inputs that are created dynamically and inserted into the body
	var observer = new MutationObserver(function(mutations, observer) {
		for (var i = 0; i < mutations.length; i++) {
			if (mutations[i].addedNodes.length > 0) {
				convertInputs(mutations[i].addedNodes);
			}
		}
	});

	observer.observe(document.body, {childList: true, subtree: true});

	/***********************
	 **** Drag and drop ****
	 ***********************/
	// keep a reference to the original method
	var _addEventListener = EventTarget.prototype.addEventListener;

	DataTransfer.prototype[getFilesMethod] = function() {
		return Promise.resolve([]);
	};

	EventTarget.prototype.addEventListener = function(type, listener, useCapture) {
		if (type === 'drop') {
			var _listener = listener;

			listener = function(e) {
				var dir = new Directory();
				dir._items = e.dataTransfer.items;

				e.dataTransfer[getFilesMethod] = function() {
					return dir[getFilesMethod]();
				};

				_listener(e);
			};
		}

		// call the original method
		return _addEventListener.apply(this, arguments);
	};
}

// src/index.coffee
var TractorBeam;
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
var hasProp = {}.hasOwnProperty;

TractorBeam = (function(superClass) {
  extend(TractorBeam, superClass);

  function TractorBeam(selector, opts) {
    this.selector = selector;
    this.opts = opts != null ? opts : {};
    TractorBeam.__super__.constructor.apply(this, arguments);
    if (this.opts.polyfill !== false) {
      directoryUploadPolyfill();
    }
    this.el = document.querySelector(this.selector);
    this.queue = {};
    this.bind();
  }

  TractorBeam.prototype.bind = function() {
    var uppie$$1;
    this.el.addEventListener('dragleave', (function(_this) {
      return function(event) {
        return _this.dragHover(event);
      };
    })(this));
    this.el.addEventListener('dragover', (function(_this) {
      return function(event) {
        return _this.dragHover(event);
      };
    })(this));
    uppie$$1 = new uppie();
    return uppie$$1(this.el, (function(_this) {
      return function(event, formData, files) {
        return _this.drop(event, formData, files);
      };
    })(this));
  };

  TractorBeam.prototype.dragHover = function(event) {
    event.stopPropagation();
    return event.preventDefault();
  };

  TractorBeam.prototype.drop = function(event, formData, files) {
    var file, i, len;
    console.log(arguments);
    if (!files.length) {
      return;
    }
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      this.emit('file', file);
      this.queue[file] = {
        path: file
      };
    }
    return this.emit('dropped', this.queue);
  };

  TractorBeam.prototype.add = function(filepath) {
    this.queue[filepath].skipped = false;
    return this;
  };

  TractorBeam.prototype.remove = function(filepath) {
    var file;
    file = this.queue[filepath];
    delete this.queue[filepath];
    return file;
  };

  TractorBeam.prototype.skip = function(filepath) {
    this.queue[filepath].skipped = true;
    return this;
  };

  return TractorBeam;

})(EventEmitter$1);

var TractorBeam$1 = TractorBeam;

return TractorBeam$1;

}());
