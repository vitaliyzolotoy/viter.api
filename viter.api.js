var express = require("express"),
    mongoose = require('mongoose'),
    inherit = require('inherit');

var viter = express();

// Database
mongoose.connect('mongodb://localhost/viter');

// Config
viter.configure(function(){
    viter.set('port', process.env.PORT || 4000);
    viter.use(express.logger('dev'));
    viter.use(express.bodyParser());
    viter.use(express.methodOverride());
    viter.use(viter.router);
});

viter.configure('development', function(){
  viter.use(express.errorHandler());
});






// base "class"
var Core = inherit(/** @lends Core.prototype */{
    __constructor : function(request, response) { // constructor
        this._self = this;
        this._request = request || {};
        this._response = response || {};
    },

    checkClientId : function() {
        return true;
    },

    isClient : function() {
        return true;
    },

    checkApiStatus : function() {
        var data = {};
        data.status = '200 OK';
        data.message = 'API is running';
        controllers.renderData(request, response, data);
    },

    renderData : function(data) {
        this._response.charset = 'utf8';
        this._response.type('application/json');
        this._response.json(data);
        return this._response;
    }
}, /** @lends A */ {
});

// inherited "class" from Core
var Articles = inherit(Core, /** @lends Articles.prototype */{
    createNewArticle : function() {
    },

    getArticlesList : function() {
        var _self = this;
        ArticleModel.find(function(error, articles) {
            var data = {};
            if (!error) {
                if (articles != false) {
                    data.status = '200 OK';
                    data.articles = articles;
                    _self.renderData(data);
                } else {
                    data.status = '204 No Content';
                    _self.renderData(data);
                }
            }
        });
    }

}, /** @lends Articles */ {
    getArticleById : function() {
        return true;
    },

    updateArticleById : function() {
        return true;
    },

    destroyArticleById : function() {
        return true;
    }
});




// Status
viter.get('/', function(request, response) {
    var articles = new Articles(request, response);
    articles.getArticlesList();
});

// Articles
viter.get('/articles', function(request, response) {
    var articles = new Articles(request, response);
    articles.getArticlesList();
});


// var instanceOfB = new B('property');

// instanceOfB.getProperty(); // returns 'property of instanceB'
// instanceOfB.getType(); // returns 'AB'
// B.staticMethod(); // returns 'staticA of staticB'











// Define Model for Article
var article = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

var ArticleModel = mongoose.model('article', article);




var controllers = {
    checkClientId: function(request, response) {
        return request.query.client_id === '2213122435';
    },

    checkApiKey: function(request, response) {
        return request.query.api_key === '3523424t3334m3rddf3345';
    },

    isClient: function(request, response) {
        return true;
        // return this.checkClientId(request, response) && this.checkApiKey(request, response);
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

    getArticlesList: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ArticleModel.find(function(error, articles) {
                if (!error) {
                    if (articles != false) {
                        data.status = '200 OK';
                        data.articles = articles;
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

    createNewArticle: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            if (request.query.title && request.query.content) {
                var article;
                article = new ArticleModel({
                    title: request.query.title,
                    content: request.query.content
                });
                article.save(function(error) {
                    if (!error) {
                        data.status = '200 OK';
                        data.article = article;
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

    // 51c86eb9fa9d273803000002
    getArticleById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ArticleModel.findById(request.params.id, function(error, article) {
                if (!error) {
                    if (article) {
                        data.status = '200 OK';
                        data.article = article;
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

    updateArticleById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ArticleModel.findById(request.params.id, function (error, article) {
                if (article) {
                    if (request.query.title && request.query.content) {
                        article.title = request.query.title;
                        article.content = request.query.content;
                        article.save(function(error) {
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

    destroyArticleById: function(request, response) {
        var data = {};
        if (controllers.isClient(request, response)) {
            ArticleModel.findById(request.params.id, function (error, article) {
                if (article) {
                    article.remove(function(error) {
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

// Show All Articles
// viter.get('/articles', function (request, response) {
//     controllers.getArticlesList(request, response);
// });



// New Article
viter.get('/articles/new', function (request, response) {
    controllers.createNewArticle(request, response);
});



// Show Article
viter.get('/articles/:id', function (request, response) {
    controllers.getArticleById(request, response);
});



// Update Article
viter.get('/articles/:id/update', function (request, response) {
    controllers.updateArticleById(request, response);
});



// Destroy Article
viter.get('/articles/:id/destroy', function (request, response) {
    controllers.destroyArticleById(request, response);
});



viter.listen(4000);
