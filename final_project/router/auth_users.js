const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.filter(x => x.username == username).length <= 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.filter(x => x.username == username && x.password == password).length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(username && password){
    if(authenticatedUser(username, password)){
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60 * 60})

        req.session.authorization = {accessToken, username}
        return res.status(200).json({message: "Login successfull"})
    }else{
        return res.status(403).json({message: "username or password wrong"})
    }
  }else{
    return res.status(401).json({message: "username or password missing"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.query.review;
    if(!isbn || !review){
        return res.status(403).json({message: "Check param and query"})
    }

    let book = books[isbn];
    if(!book)
        return res.status(404).json({message: "Not found the book"})
    
    let {username} = req.session.authorization;
    if(!username)
        return res.status(401).json({message: "You need login first"})

    let reviews = book["reviews"]
    reviews[username] = review;
    return res.status(200).json({message: `Reviews with the book have isbn = ${isbn} updated (username = ${username})`, reviews: reviews})
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    if(!isbn){
        return res.status(403).json({message: "Check param"})
    }

    let book = books[isbn];
    if(!book)
        return res.status(404).json({message: "Not found the book"})
    
    let {username} = req.session.authorization;
    if(!username)
        return res.status(401).json({message: "You need login first"})

    let reviews = book["reviews"];
    reviews[username] = undefined;
    return res.status(200).json({message: `Reviews with the book have isbn = ${isbn} of username = ${username} was delete`, reviews: reviews})
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
