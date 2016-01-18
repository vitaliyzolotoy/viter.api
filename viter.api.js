var //config = require('./config'),
    fs = require('fs'),
    express = require('express'),
    bodyParser  = require('body-parser'),
    mongoose = require('mongoose'),
    aws = require('aws-sdk'),
    viter = express();

// AWS config
aws.config.loadFromPath('./aws.json');

// Database
mongoose.connect('mongodb://0.0.0.0/viter');

// Config
viter.set('port', process.env.PORT || 4000);
viter.use(bodyParser({limit: '50mb'}));

var note = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: false
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId
    },
    section: {
        type: String
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
            // NoteModel.find(null, null, {sort: {created: -1}}, function(error, notes) {
            NoteModel.find({}, null, {sort: {chapter: 1}}, function(error, notes) {
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
            if (request.body.title && request.body.content) {
                var note;
                note = new NoteModel({
                    title: request.body.title,
                    content: request.body.content,
                    created: Date.now(),
                });
                note.save(function(error) {
                    if (!error) {
                        data.status = '200 OK';
                        data.message = 'The note was created';
                        data.note = note;
                        controllers.renderData(request, response, data);
                    };
                });
            } else {
                data.status = '400 Bad Request';
                controllers.renderData(request, response, data);
            };
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
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
            NoteModel.findById(request.params.id, function(error, note) {
                if (!error) {
                    if (note) {
                        if (request.body.title && request.body.content) {
                            if (request.body.publish === true && request.body.chapter) {
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
                                                        note.title = request.body.title;
                                                        note.content = request.body.content,
                                                        note.created = Date.now();
                                                        note.modified = Date.now();
                                                        note.published = true;
                                                        note.chapter = chapter._id;
                                                        note.section = chapter.section + '.' + (count + 1);
                                                        note.save(function(error, note) {
                                                            if (!error) {
                                                                data.status = '200 OK';
                                                                data.message = 'The note was updated';
                                                                data.note = note;
                                                                controllers.renderData(request, response, data);
                                                            }
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
                                                note.title = request.body.title;
                                                note.content = request.body.content;
                                                note.created = Date.now();
                                                note.modified = Date.now();
                                                note.published = true;
                                                note.chapter = chapter._id;
                                                note.section = chapter.section + '.' + (count + 1);
                                                note.save(function(error, note) {
                                                    if (!error) {
                                                        data.status = '200 OK';
                                                        data.message = 'The note was updated';
                                                        data.note = note;
                                                        controllers.renderData(request, response, data);
                                                    }
                                                });
                                            });
                                        };
                                    });
                                };
                            } else {
                                note.title = request.body.title;
                                note.content = request.body.content;
                                note.modified = Date.now();
                                note.save(function(error, note) {
                                    if (!error) {
                                        data.status = '200 OK';
                                        data.message = 'The note was updated';
                                        data.note = note;
                                        controllers.renderData(request, response, data);
                                    }
                                });
                            };
                        } else {
                            data.status = '400 Bad Request';
                            controllers.renderData(request, response, data);
                        };
                    } else {
                        data.status = '204 No Content';
                        controllers.renderData(request, response, data);
                    };
                };
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        };
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
            // NoteModel.find({}, null, {sort: {created: -1}}, function(error, notes) {
            NoteModel.find({}, null, {sort: {chapter: 1}}, function(error, notes) {
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
        console.log(request.headers);
        var data = {};
        if (request.body && request.body.email === 'e' && request.body.password === 'p') {
            data.message = 'welcome';
        } else {
            data.message = 'user not found';
        }
        controllers.renderData(request, response, data);
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

    uploadMedia: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            var s3bucket = new aws.S3({ params: { Bucket: 'assets.thefeature.com.ua' } });
            var imageName = Math.random().toString(36).substr(2, 9);
            var imageBody = new Buffer(request.body.file.replace(/^data:image\/\w+;base64,/, ''),'base64');
            var params = {
                Key: imageName, 
                Body: imageBody,
                ContentEncoding: 'base64',
                ContentType: request.body.type
            };
            s3bucket.upload(params, function(err, file) {
                if (err) {
                    console.log("Error uploading data: ", err);
                } else {
                    data.status = '200 OK';
                    data.message = 'A Media was uploaded';
                    data.url = 'http://assets.thefeature.com.ua/' + imageName;
                    controllers.renderData(request, response, data);
                };
            });
        } else {
            data.status = '403 Forbidden';
            controllers.renderData(request, response, data);
        }
    }
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

// Show All Chapters
viter.get('/chapters', function (request, response) {
    controllers.getChaptersList(request, response);
});

// Show Chapter
viter.get('/chapters/:id', function (request, response) {
    controllers.getChapterById(request, response);
});

// Upload Media
viter.post('/upload', function (request, response) {
    controllers.uploadMedia(request, response);
});

viter.listen(4000);
