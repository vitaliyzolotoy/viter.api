var config = require('./config'),
    fs = require('fs'),
    express = require('express'),
    mongoose = require('mongoose'),
    aws = require('aws-sdk'),
    viter = express();

// AWS config
aws.config.loadFromPath('./aws.json');

// Database
mongoose.connect('mongodb://0.0.0.0/viter');

// Config
viter.configure(function(){
    viter.set('port', process.env.PORT || 4000);
    viter.use(express.logger('dev'));
    viter.use(express.bodyParser());
    viter.use(express.methodOverride());
    viter.use(viter.router);
});

var note = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true,
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

var NoteModel = mongoose.model('note', note);

var chapter = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

var ChapterModel = mongoose.model('chapter', chapter);

var controllers = {
    isClient: function() {
        return true;
    },

    renderData: function(request, response, data) {
        return response.send(data);
    },

    checkApiStatus: function(request, response) {
        var data = {};
        data.status = '200 OK';
        data.message = 'API is running';
        controllers.renderData(request, response, data);
    },

    getNotesList: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            NoteModel.find({}, null, {sort: {created: -1}}, function(error, notes) {
            // NoteModel.find({}, null, function(error, notes) {
                if (!error) {
                    if (notes != false) {
                        data.status = '200 OK';
                        data.message = 'A list of all notes';
                        data.notes = notes;
                        controllers.renderData(request, response, data);
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    }
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    createNewNote: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            if (request.body.title && request.body.content && request.body.chapter) {
                if (request.body.chapter.create) {
                    ChapterModel.count({}, function(error, count) {
                        if (!error) {
                            var chapter;
                            chapter = new ChapterModel({
                                content: request.body.chapter.create,
                                section: count + 1
                            });
                            chapter.save(function(error, chapter) {
                                if (!error) {
                                    NoteModel.count({'chapter': chapter._id}, function(error, count) {
                                        var note;
                                        note = new NoteModel({
                                            title: request.body.title,
                                            content: request.body.content,
                                            section: chapter.section + '.' + (count + 1),
                                            chapter: chapter._id
                                        });
                                        note.save(function(error) {
                                            if (!error) {
                                                data.status = '200 OK';
                                                data.message = 'The note was created';
                                                data.note = note;
                                                controllers.renderData(request, response, data);
                                            };
                                        });
                                    });
                                };
                            });
                        };
                    });
                } else {
                    ChapterModel.findById(request.body.chapter.select, function(error, chapter) {
                        if (!error) {
                            NoteModel.count({'chapter': chapter._id}, function(error, count) {
                                var note;
                                note = new NoteModel({
                                    title: request.body.title,
                                    content: request.body.content,
                                    section: chapter.section + '.' + (count + 1),
                                    chapter: chapter._id,
                                });
                                note.save(function(error) {
                                    if (!error) {
                                        data.status = '200 OK';
                                        data.message = 'The note was created';
                                        data.note = note;
                                        controllers.renderData(request, response, data);
                                    };
                                });
                            });
                        };
                    });
                };
            } else {
                data.status = '400 Bad Request';
                controllers.renderData(request, response, data);
            };
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        };
    },

    getNoteById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            NoteModel.findById(request.params.id, function(error, note) {
                if (!error) {
                    if (note) {
                        data.status = '200 OK';
                        data.message = 'The note was found';
                        data.note = note;
                        controllers.renderData(request, response, data);
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    }
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    updateNoteById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            NoteModel.findById(request.params.id, function (error, note) {
                if (note) {
                    if (request.body.title && request.body.content && request.body.chapter) {
                        note.title = request.body.title;
                        note.chapter = request.body.chapter,
                        note.content = request.body.content;
                        note.modified = Date.now();
                        note.save(function(error) {
                            if (!error) {
                                data.status = '200 OK';
                                data.message = 'The note was updated';
                                controllers.renderData(request, response, data);
                            }
                        });
                    } else {
                        data.status = '400 Bad Request';
                        controllers.renderData(request, response, data);
                    }
                } else {
                    data.status = '204 No Content';
                    controllers.renderData(request, response, data);
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    destroyNoteById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            NoteModel.findById(request.params.id, function (error, note) {
                if (note) {
                    note.remove(function(error) {
                        if (!error) {
                            data.status = '200 OK';
                            data.message = 'The note was destroyed';
                            controllers.renderData(request, response, data);
                        }
                    });
                } else {
                    data.status = '204 No Content';
                    controllers.renderData(request, response, data);
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    getNextAndPrevNote: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            NoteModel.find({}, null, {sort: {created: -1}}, function(error, notes) {
            // NoteModel.find({}, null, function(error, notes) {
                if (!error) {
                    if (notes != false) {
                        notes.filter(function(note, index) {
                            if (note._id == request.params.id) {
                                data.status = '200 OK';
                                data.message = 'Next and prev notes';
                                data.nextprev = [notes[index - 1], notes[index + 1]];
                                controllers.renderData(request, response, data);
                            }
                        });
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    }
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    login: function(request, response) {
        var data = {};
        if (request.body && request.body.email === 'e' && request.body.password === 'p') {
            data.message = 'welcome';
        } else {
            data.message = 'user not found';
        }
        controllers.renderData(request, response, data);
    },

    uploadMedia: function(request, response) {
        var data = {},
            media = request.files;
        data.files = [];
        if (media) {
            Object.keys(request.files).map(function(index) {
                var fileName = media[index].name,
                    filePath = media[index].path,
                    fileSize = media[index].size;
                data.files.push(fileName);
                fs.readFile(filePath, function(error, buffer) {
                    params = {
                        Bucket: config.bucket,
                        Key: fileName,
                        Body: buffer
                    };
                    if (fileSize > 0) {
                        var s3 = new aws.S3();
                        s3.putObject(params, function (error) {
                            if (!error) {
                                data.status = '200 OK';
                                data.message = 'Successfully uploaded data';
                                controllers.renderData(request, response, data);
                            } else {
                                data.status = '400 Bad Request';
                                data.message = 'Error uploading data';
                                controllers.renderData(request, response, data);
                                console.log(error);
                            }
                        });
                    };
                });
            });
        } else {
            data.status = '204 No Content';
            controllers.renderData(request, response, data);
        };
    },

    getChaptersList: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ChapterModel.find({}, null, {sort: {created: -1}}, function(error, chapters) {
            // ChapterModel.find({}, null, function(error, chapters) {
                if (!error) {
                    if (chapters != false) {
                        data.status = '200 OK';
                        data.message = 'A list of all chapters';
                        data.chapters = chapters;
                        controllers.renderData(request, response, data);
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    }
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    getChapterById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ChapterModel.findById(request.params.id, function(error, chapter) {
                if (!error) {
                    if (chapter) {
                        data.status = '200 OK';
                        data.message = 'The chapter was found';
                        data.chapter = chapter;
                        controllers.renderData(request, response, data);
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    }
                }
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    },

    // getTagsListRelationalToId: function(request, response) {
    //     var data = {};
    //     if (controllers.isClient(request, response)) {
    //         TagModel.find({'relational': request.params.id}, null, {sort: {created: -1}}, function(error, tags) {
    //             if (!error) {
    //                 if (tags != false) {
    //                     data.status = '200 OK';
    //                     data.message = 'A list of all tags relational to ID';
    //                     data.tags = tags;
    //                     controllers.renderData(request, response, data);
    //                 } else {
    //                     data.status = '204 No Content';
    //                     controllers.renderData(request, response, data);
    //                 }
    //             }
    //         });
    //     } else {
    //         data.status = '403 Forbidden';
    //         controllers.renderData(request, response, data);
    //     }
    // }

};

// Status
viter.get('/', function (request, response) {
    controllers.checkApiStatus(request, response);
});

// Show All Notes
viter.get('/notes', function (request, response) {
    controllers.getNotesList(request, response);
});

// New Note
viter.post('/notes', function (request, response) {
    controllers.createNewNote(request, response);
});

// Show Note
viter.get('/notes/:id', function (request, response) {
    controllers.getNoteById(request, response);
});

// Update Note
viter.put('/notes/:id', function (request, response) {
    controllers.updateNoteById(request, response);
});

// Destroy Note
viter.delete('/notes/:id', function (request, response) {
    controllers.destroyNoteById(request, response);
});

// Next Prev
viter.get('/nextprev/:id', function (request, response) {
    controllers.getNextAndPrevNote(request, response);
});

// Login
viter.get('/login', function (request, response) {
    controllers.login(request, response);
});

// Upload Media
viter.post('/media', function (request, response) {
    controllers.uploadMedia(request, response);
});

// Show All Chapters
viter.get('/chapters', function (request, response) {
    controllers.getChaptersList(request, response);
});

// New Chapter
// viter.post('/chapters', function (request, response) {
//     controllers.createNewChapter(request, response);
// });

// Show Chapter
viter.get('/chapters/:id', function (request, response) {
    controllers.getChapterById(request, response);
});

viter.listen(4000);
