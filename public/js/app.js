/*global app, $on */
(function() {
  'use strict';

  /**
   * Sets up a brand new Todo list.
   *
   * @param {string} name The name of your new to do list.
   */
  function Todo(name) {
    const self = this;
    self.storage = new app.Store(
      name,
      items => {
        self.model = new app.Model(self.storage);
        self.template = new app.Template();
        self.view = new app.View(self.template);
        self.controller = new app.Controller(self.model, self.view);

        function setView() {
          self.controller.setView(document.location.hash);
        }

        $on(window, 'load', setView);
        $on(window, 'hashchange', setView);
        setView();
      },
      () => {
        self.controller._filter(true);
      }
    );
  }

  var todo = new Todo('todos-twiliosync-bar');
})();
