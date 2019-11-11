const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");


const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// const upload = multer({
// 	dest: uploadPath,
// 	fileFilter: (req, file, callback) => {
// 		callback(null, imageMimeTypes.includes(file.mimetype));
// 	}
// });

// All Books route
router.get("/", async (req, response) => {
	let query = Book.find();
	if (req.query.title != null && req.query.title != "") {
		query = query.regex("title", new RegExp(req.query.title, "i"));
	}
	if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
		query = query.lte("publishDate", req.query.publishedBefore);
	}
	if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
		query = query.gte("publishDate", req.query.publishedAfter);
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
router.post("/", async (req, response) => {
	const book = new Book({
		title: req.body.title,
		author: req.body.author,
		publishDate: new Date(req.body.publishDate),
		pageCount: req.body.pageCount,
		description: req.body.description
	});
	saveCover(book, req.body.cover);
	console.log(book);
	try {
		const newBook = await book.save();
		response.redirect(`books`);
	} catch {
		renderNewPage(response, book, true);
	}
});

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

// Funciton to save the image uploaded via filepond

function saveCover(book, coverEncoded) {
	if (coverEncoded == null) {
		return;
	}
	const cover = JSON.parse(coverEncoded);
	if (cover != null && imageMimeTypes.includes(cover.type)) {
		book.coverImage = new Buffer.from(cover.data, "base64");
		book.coverImageType = cover.type;
	}
}

module.exports = router;
