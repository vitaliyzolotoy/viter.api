var express = require("express"),
    mongoose = require('mongoose'),
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

// Define Model for Article
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
    }
});

var NoteModel = mongoose.model('note', note);

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
            NoteModel.find(function(error, notes) {
                if (!error) {
                    if (notes != false) {
                        data.status = '200 OK';
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
        console.log(request);
        if (controllers.isClient(request, response)) {
            if (request.body.title && request.body.content) {
                var note;
                note = new NoteModel({
                    title: request.body.title,
                    content: request.body.content
                });
                note.save(function(error) {
                    if (!error) {
                        data.status = '200 OK';
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
                        note.content = request.body.content;
                        note.save(function(error) {
                            if (!error) {
                                data.status = '200 OK';
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
viter.post('/notes/:id', function (request, response) {
    controllers.updateNoteById(request, response);
});

// Destroy Note
viter.delete('/notes/:id', function (request, response) {
    controllers.destroyNoteById(request, response);
});

viter.listen(4000);
