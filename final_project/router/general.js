const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(username && password){
      if(isValid(username)){
        users.push({username: username, password: password});
        return res.status(200).json({message: "Register successfull"})
      }else{
        return res.status(403).json({message: "username was exist"})
      }
  }
  return res.status(403).json({message: "Not valid username or password"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    setTimeout(() => {
        return res.status(200).json({books: books})
    }, 200);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    return new Promise((rel, rej) => {
        let isbn = req.params.isbn;
        if(isbn){
            let book = books[isbn];
            if(book){
                return rel({book: book});
            }
            return rel({message: "Not found book with ISBN = " + isbn});
        }
        return rej({message: "Param ISBN missing"});
    }).then(val => {
        return res.status(200).json(val);
    }, err =>{
        return res.status(403).json(err);
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    return new Promise((rel, rej) => {
        let author = req.params.author;
        if(author){
            let listBooks = []
            for(let isbn in books){
                let book = books[isbn];
                if(book["author"] == author){
                    listBooks.push(book);
                }
            }
            return rel({books: listBooks});
        }
        return rej({message: "Param author missing"});
    }).then(val => {
        return res.status(200).json(val);
    }, err =>{
        return res.status(403).json(err);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    return new Promise((rel, rej) => {
        let title = req.params.title;
        if(title){
            let listBooks = []
            for(let isbn in books){
                let book = books[isbn];
                if(book["title"] == title){
                    listBooks.push(book);
                }
            }
            return rel({books: listBooks});
        }
        return rej({message: "Param title missing"});
    }).then(val => {
        return res.status(200).json(val);
    }, err =>{
        return res.status(403).json(err);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    if(isbn){
        let book = books[isbn];
        if(book)
            return res.status(200).json({review: book["reviews"]});
        return res.status(200).json({review: null});
    }
    return res.status(403).json({message: "Param isbn missing"});
});

module.exports.general = public_users;
