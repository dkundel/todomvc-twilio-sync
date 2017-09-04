/*jshint eqeqeq:false */
(function(window) {
  'use strict';

  /**
   * Creates a new client side storage object and will create an empty
   * collection if no collection already exists.
   *
   * @param {string} name The name of our DB we want to use
   * @param {function} callback Our fake DB uses callbacks because in
   * real life you probably would be making AJAX calls
   */
  function Store(name, callback, eventHandler) {
    callback = callback || function() {};

    this._dbName = name;

    // START SYNC
    fetch('/token')
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not retrieve token');
        }
        return response.json();
      })
      .then(data => {
        this._client = new Twilio.Sync.Client(data.token);
        return this._client.list(name);
      })
      .then(list => {
        this._list = list;
        this._list.on('itemAdded', () => {
          eventHandler();
        });
        this._list.on('itemUpdated', () => {
          eventHandler();
        });
        this._list.on('itemRemoved', () => {
          eventHandler();
        });
        return list.getItems();
      })
      .then(todos => {
        callback.call(this, {
          todos: todos.items.map(extractData)
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  /**
   * Finds items based on a query given as a JS object
   *
   * @param {object} query The query to match against (i.e. {foo: 'bar'})
   * @param {function} callback	 The callback to fire when the query has
   * completed running
   *
   * @example
   * db.find({foo: 'bar', hello: 'world'}, function (data) {
   *	 // data will return any items that have foo: bar and
   *	 // hello: world in their properties
   * });
   */
  Store.prototype.find = function(query, callback) {
    if (!callback) {
      return;
    }

    this._list.getItems().then(todos => {
      callback.call(
        this,
        todos.items.map(extractData).filter(createFilterFunction(query))
      );
    });
  };

  /**
   * Will retrieve all data from the collection
   *
   * @param {function} callback The callback to fire upon retrieving data
   */
  Store.prototype.findAll = function(callback) {
    callback = callback || function() {};
    this._list.getItems().then(todos => {
      callback.call(this, todos.items.map(extractData));
    });
  };

  /**
   * Will save the given data to the DB. If no item exists it will create a new
   * item, otherwise it'll simply update an existing item's properties
   *
   * @param {object} updateData The data to save back into the DB
   * @param {function} callback The callback to fire after saving
   * @param {number} id An optional param to enter an ID of an item to update
   */
  Store.prototype.save = function(updateData, callback, id) {
    callback = callback || function() {};

    if (typeof id !== 'undefined') {
      this._list
        .update(id, updateData)
        .then(item => {
          return this._list.getItems();
        })
        .then(todos => {
          callback.call(this, todos.items.map(extractData));
        });
    } else {
      this._list.push(updateData).then(item => {
        updateData.id = item.index;
        this._list
          .update(updateData.id, {
            id: updateData.id
          })
          .then(() => {
            callback.call(this, [updateData]);
          });
      });
    }
  };

  /**
   * Will remove an item from the Store based on its ID
   *
   * @param {number} id The ID of the item you want to remove
   * @param {function} callback The callback to fire after saving
   */
  Store.prototype.remove = function(id, callback) {
    callback = callback || function() {};

    this._list
      .remove(id)
      .then(() => {
        return this._list.getItems();
      })
      .then(todos => {
        callback.call(this, todos.items.map(extractData));
      });
  };

  /**
   * Will drop all storage and start fresh
   *
   * @param {function} callback The callback to fire after dropping the data
   */
  Store.prototype.drop = function(callback) {
    callback = callback || function() {};

    const data = {
      todos: []
    };
    localStorage[this._dbName] = JSON.stringify(data);
    callback.call(this, data.todos);

    this._list
      .removeList()
      .then(() => {
        this._client.list(this._dbName);
      })
      .then(list => {
        this._list = list;
        return this._list.getItems();
      })
      .then(todos => {
        callback.call(this, todos.items.map(extractData));
      });
  };

  function createFilterFunction(query) {
    return function(todo) {
      for (let q in query) {
        if (query[q] !== todo[q]) {
          return false;
        }
      }
      return true;
    };
  }

  function extractData(todo) {
    return todo.data.value;
  }

  // Export to window
  window.app = window.app || {};
  window.app.Store = Store;
})(window);
