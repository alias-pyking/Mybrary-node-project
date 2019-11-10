const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
	dest: uploadPath,
	fileFilter: (req, file, callback) => {
		callback(null, imageMimeTypes.includes(file.mimetype));
	}
});
// All Books route
router.get("/", async (req, response) => {
	let query = Book.find();
	if (req.query.title != null && req.query.title != "") {
		query = query.regex("title", new RegExp(req.query.title, "i"));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
		query = query.lte('publishDate',req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
		query = query.gte('publishDate',req.query.publishedAfter);
	}
	try {
		const books = await query.exec();
		const params = {
			books: books,
			searchOptions: req.query
		};
		response.render("books/index", params);
	} catch {
		response.redirect("/");
	}
});

//New Book route
router.get("/new", async (req, response) => {
	renderNewPage(response, new Book());
});
// create new book
router.post("/", upload.single("cover"), async (req, response) => {
	const filename = req.file != null ? req.file.filename : null;
	const book = new Book({
		title: req.body.title,
		author: req.body.author,
		publishDate: new Date(req.body.publishDate),
		pageCount: req.body.pageCount,
		coverImageName: filename,
		description: req.body.description
	});

	try {
		const newBook = await book.save();
		response.redirect(`books`);
	} catch {
		if (book.coverImageName != null) {
			removeBookCover(book.coverImageName);
		}
		renderNewPage(response, book, true);
	}
});
function removeBookCover(fileName) {
	fs.unlink(path.join(uploadPath, fileName), err => {
		if (err) console.error(err);
	});
}
async function renderNewPage(res, book, hasError = false) {
	try {
		const authors = await Author.find({});
		const params = {
			authors: authors,
			book: book
		};
		if (hasError) params.errorMessage = "Error Creating Book";
		res.render("books/new", params);
	} catch {
		res.redirect("/books");
	}
}
module.exports = router;
