var fs = require('fs'),
    express = require('express'),
    mongoose = require('mongoose'),
    aws = require('aws-sdk'),
    viter = express();

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
    tags: {
        type: String,
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
    }
});

var NoteModel = mongoose.model('note', note);

var tag = mongoose.Schema({
    relational: {
        type: mongoose.Schema.Types.ObjectId,
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
    }
});

var TagModel = mongoose.model('tag', tag);

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
            if (request.body.title && request.body.content) {
                var note;
                note = new NoteModel({
                    title: request.body.title,
                    content: request.body.content
                });
                note.save(function(error) {
                    if (!error) {
                        request.body.tags && controllers.createNewTags(note.id, request.body.tags);
                        data.status = '200 OK';
                        data.message = 'The note was created';
                        data.note = note;
                        controllers.renderData(request, response, data);
                    }
                });
            } else {
                data.status = '400 Bad Request';
                controllers.renderData(request, response, data);
            }
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
            NoteModel.findById(request.params.id, function (error, note) {
                if (note) {
                    if (request.body.title && request.body.content) {
                        note.title = request.body.title;
                        note.tags = request.body.tags && controllers.createNewTags(request.body.id, request.body.tags),
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

    getTagsList: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            TagModel.find({}, null, {sort: {created: -1}}, function(error, tags) {
                if (!error) {
                    if (tags != false) {
                        data.status = '200 OK';
                        data.message = 'A list of all tags';
                        data.tags = tags;
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

    getTagsListRelationalToId: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            TagModel.find({'relational': request.params.id}, null, {sort: {created: -1}}, function(error, tags) {
                if (!error) {
                    if (tags != false) {
                        data.status = '200 OK';
                        data.message = 'A list of all tags relational to ID';
                        data.tags = tags;
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

    createNewTags: function(relational, content) {
        var tag,
            tags = content.split(',');
        tags.map(function(item) {
            tag = new TagModel({
                relational: relational,
                content: item
            });
            tag.save();
        });
    },

    login: function (request, response) {
        var data = {};
        if (request.body && request.body.email === 'e' && request.body.password === 'p') {
            data.message = 'welcome';
        } else {
            data.message = 'user not found';
        }
        controllers.renderData(request, response, data);
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

// Show All Tags
viter.get('/tags', function (request, response) {
    controllers.getTagsList(request, response);
});

// Show All Tags relational to ID
viter.get('/tags/:id', function (request, response) {
    controllers.getTagsListRelationalToId(request, response);
});

// Login
viter.get('/login', function (request, response) {
    controllers.login(request, response);
});

viter.listen(4000);
