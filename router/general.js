const express = require('express');
const axios = require('axios');
let books = require("../db/booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

//Internal Endpoint so Axios can have an URL to consult with
public_users.get('/internal/books', (req, res) => {
  res.json(books);
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get('http://localhost:5000/internal/books')
    .then(response => {
      const data = response.data;
      const book = data[isbn];

      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Failed to fetch book by ISBN" });
    });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    const response = await axios.get('http://localhost:5000/internal/books');
    const allBooks = Object.values(response.data);

    const filtered = allBooks.filter(book => book.author.toLowerCase() === author);

    if (filtered.length > 0) {
      return res.status(200).json(filtered);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to search by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get('http://localhost:5000/internal/books');
    const allBooks = Object.values(response.data);

    const filtered = allBooks.filter(book => book.title.toLowerCase() === title);

    if (filtered.length > 0) {
      return res.status(200).json(filtered);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to search by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
