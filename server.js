
const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

// Sets up the Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static file paths
const dbFilePath = path.join(__dirname, 'db', 'db.json');
const notesHtmlPath = path.join(__dirname, 'main', 'notes.html');
const indexHtmlPath = path.join(__dirname, 'main', 'index.html');
const staticPath = path.join(__dirname, 'main');

// Routes

// Serving assets statically
app.use(express.static(staticPath));

// Returns all notes
app.get('/api/notes', (req, res) => {
    res.header("Content-Type", 'application/json');
    res.sendFile(dbFilePath);
});

// Basic route that sends the user to the notes page
app.get('/notes', (req, res) => res.sendFile(notesHtmlPath));

// All other routes direct to the index page
app.get('*', (req, res) => res.sendFile(indexHtmlPath));

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (!title || !text) {
        res.status(400);
        res.send('Title and text are required.');
        return;
    }

    const newNote = {
        title,
        text,
        id: uniqid()
    };

    const notesText = fs.readFileSync(dbFilePath);
    const notes = JSON.parse(notesText);
    notes.push(newNote);
    const updatedNotes = JSON.stringify(notes, null, '\t');
    try {
        fs.writeFileSync(dbFilePath, updatedNotes);
    } catch (error) {
        console.log(error);
    }
    console.log('Note added!');
    res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
    const notesText = fs.readFileSync(dbFilePath);
    const notes = JSON.parse(notesText);
    const newDb = notes.filter(function (note) {
        const noteId = req.params.id;
        return note.id != noteId;
    });
    const updatedNotes = JSON.stringify(newDb, null, '\t');
    try {
        fs.writeFileSync(dbFilePath, updatedNotes);
    } catch (error) {
        console.log(error);
    }
    console.log('Note deleted!');
    res.send('Note deleted!');
})

// Starts the server to begin listening
app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));