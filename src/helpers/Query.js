/*
 * Tiniru Doc
 * Version 0.1, 2019
 * 
 * @website - https://tiniru.com
 * 
 */
import { Config } from '../config.js'

const DB_name = Config.DB_name;
const DB_version = Config.DB_version;


export function getRecord(table, indexKey, callback) {
    var request = window.indexedDB.open(DB_name, DB_version);
    var db;
    request.onsuccess = function (event) {
        db = event.target.result;
        //console.log(db);
        var transaction = db.transaction([table], "readonly");
        var objectStore = transaction.objectStore(table);
        var objectStoreRequest = objectStore.get(indexKey);;
        objectStoreRequest.onsuccess = function (event) {
            var record = objectStoreRequest.result;
            if (callback) //you'll need a calback function to return to your code
                callback(record);
        };
        transaction.oncomplete = function (event) {
            db.close();
            
        };
    };

}

export function getListRecord(table,  callback) {
    var request = window.indexedDB.open(DB_name, DB_version);
    var db;
    request.onsuccess = function (event) {
        db = event.target.result;           
        //console.log(db);
        var transaction = db.transaction([table], "readonly");
        var objectStore = transaction.objectStore(table);
        var objectStoreRequest = objectStore.getAll();
        objectStoreRequest.onsuccess = function (event) {
            var record = objectStoreRequest.result;
            if (callback) //you'll need a calback function to return to your code
                callback(record);
        };
        transaction.oncomplete = function (event) {
            db.close();
            
        };
    };

}


export function getLastRecord(table, colIndex, callback) {
    var request = window.indexedDB.open(DB_name, DB_version);
    var db;
    var lastRecord = null;
    request.onsuccess = function (event) {
        db = event.target.result;
        //console.log(db);
        var transaction = db.transaction([table], "readonly");
        var objectStore = transaction.objectStore(table);
        var index = objectStore.index(colIndex);
        var openCursorRequest = index.openCursor(null, 'prev');
        openCursorRequest.onsuccess = function (event) {
            if (event.target.result) {
                lastRecord = event.target.result.value; //the object with max revision
            }

        };
        transaction.oncomplete = function (event) {
            db.close();
            if (callback) //you'll need a calback function to return to your code
                callback(lastRecord);
        };
    };

}