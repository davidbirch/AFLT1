//= require ./store
//= require_tree ./mixins
//= require_tree ./models
//= require_tree ./controllers
//= require_tree ./views
//= require_tree ./helpers
//= require_tree ./components
//= require_tree ./templates
//= require ./router
//= require_tree ./routes
//= require_self

AFLT1.Post = DS.Model.extend({
  title: DS.attr("string"),
  author: DS.attr("string"),
  intro: DS.attr("string"),
  extended: DS.attr("string"),
  publishedAt: DS.attr("date")
});

AFLT1.PostsRoute = Ember.Route.extend({
  model: function() {
    return AFLT1.Post.find();
  }
});

AFLT1.PostsController = Ember.ArrayController.extend({
  sortProperties: ["id"],
  sortAscending: false,
  filteredContent: (function() {
    var content;
    content = this.get("arrangedContent");
    return content.filter(function(item, index) {
      return !(item.get("isNew"));
    });
  }).property("arrangedContent.@each")
});

AFLT1.PostsNewRoute = Ember.Route.extend({
  model: function() {
    return AFLT1.Post.createRecord({
      publishedAt: new Date(),
      author: "current user"
    });
  }
});

AFLT1.PostsNewController = Ember.ObjectController.extend({
  save: function() {
    return this.get('store').commit();
  },
  cancel: function() {
    this.get('content').deleteRecord();
    this.get('store').transaction().rollback();
    return this.transitionToRoute('posts');
  },
  transitionAfterSave: (function() {
    if (this.get('content.id')) {
      return this.transitionToRoute('post', this.get('content'));
    }
  }).observes('content.id')
});

AFLT1.PostController = Ember.ObjectController.extend({
  isEditing: false,
  actions: {
    edit: function() {
      return this.set("isEditing", true);
    },
    "delete": function() {
      if (window.confirm("Are you sure you want to delete this post?")) {
        this.get('content').deleteRecord();
        this.get('store').commit();
        return this.transitionToRoute('posts');
      }
    },
    doneEditing: function() {
      this.set("isEditing", false);
      return this.get('store').commit();
    }
  }
});

AFLT1.IndexRoute = Ember.Route.extend({
  redirect: function() {
    return this.transitionTo("posts");
  }
});

Ember.Handlebars.registerBoundHelper("date", function(date) {
  return moment(date).fromNow();
});

window.showdown = new Showdown.converter();

Ember.Handlebars.registerBoundHelper("markdown", function(input) {
  if (input) {
    return new Ember.Handlebars.SafeString(window.showdown.makeHtml(input));
  }
});

AFLT1.Router.map(function() {
  this.resource("about");
  return this.resource("posts", function() {
    this.resource("post", {
      path: ":post_id"
    });
    return this.route("new");
  });
});
