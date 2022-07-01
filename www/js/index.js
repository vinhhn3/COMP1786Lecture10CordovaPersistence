/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  document
    .getElementById("searchButton")
    .addEventListener("click", searchBooksByTitle);

  document
    .getElementById("showButton")
    .addEventListener("click", showBooksByAuthor);

  createDatabase();
}

var db;

function createDatabase() {
  var request = window.indexedDB.open("library");

  request.onupgradeneeded = function () {
    db = request.result;

    var store = db.createObjectStore("books", { keyPath: "isbn" });

    var titleIndex = store.createIndex("by_title", "title", { unique: true });

    var authorIndex = store.createIndex("by_author", "author");

    store.put({ title: "Title 1", author: "Author 1", isbn: 123 });
    store.put({ title: "Title 2", author: "Author 2", isbn: 456 });
    store.put({ title: "Title 3", author: "Author 3", isbn: 789 });
  };

  request.onsuccess = function () {
    db = request.result;
    alert("Database created");
  };

  request.onerror = function () {
    alert("Error creating database: " + request.errorCode);
  };
}

function searchBooksByTitle() {
  var tx = db.transaction("books", "readonly");

  var store = tx.objectStore("books");

  var index = store.index("by_title");

  var bookTitle = document.getElementById("search").value;
  var request = index.get(bookTitle);

  request.onsuccess = function () {
    var matching = request.result;
    var result = document.getElementById("result");

    if (matching != undefined) {
      result.innerHTML =
        "<br/>Title: " +
        matching.title +
        ", Author: " +
        matching.author +
        ", ISBN: " +
        matching.isbn;
    } else {
      result.innerHTML = "<br/>No match found";
    }
  };
}

function showBooksByAuthor() {
  var tx = db.transaction("books", "readonly");

  var store = tx.objectStore("books");

  var index = store.index("by_author");

  var author = document.getElementById("search").value;

  var request = index.openCursor(IDBKeyRange.only(author));

  document.getElementById("result").innerHTML = "<br/>";

  request.onsuccess = function () {
    var cursor = request.result;
    if (cursor) {
      document.getElementById("result").innerHTML +=
        "<br/>Title: " +
        cursor.value.title +
        ", Author: " +
        cursor.value.author +
        ", ISBN: " +
        cursor.value.isbn;

      cursor.continue();
    } else {
      document.getElementById("result").innerHTML +=
        "<br/><br/>Finished loading books";
    }
  };
}

function storeName() {
  var myName = document.getElementById("name").value;
  window.localStorage.setItem("name", myName);
  displayName();
  return false;
}

function displayName() {
  var result = document.getElementById("result");
  var myName = window.localStorage.getItem("name");
  if (myName != null) {
    result.innerHTML = "Your name is " + myName;
  } else {
    result.innerHTML = "Your name has not been set yet";
  }
}
