/*global app, $on */
(function() {
  'use strict';

  /**
   * Sets up a brand new Todo list.
   *
   * @param {string} name The name of your new to do list.
   */
  function Todo(name) {
    this.storage = new app.Store(
      name,
      items => {
        console.log(items);
        this.model = new app.Model(this.storage);
        this.template = new app.Template();
        this.view = new app.View(this.template);
        this.controller = new app.Controller(this.model, this.view);

        $on(window, 'load', setView);
        $on(window, 'hashchange', setView);
        setView();
      },
      () => {
        todo.controller._filter(true);
      }
    );
  }

  var todo = new Todo('todos-twiliosync-bar');
  function setView() {
    todo.controller.setView(document.location.hash);
  }
})();
