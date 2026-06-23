# 🎵 MP3 Tag Editor

A simple web application that allows users to upload MP3 audio files and edit their metadata tags such as title, artist, album, genre, year, and album artwork. Built with Node.js and powered by the **node-id3** package for reading and writing ID3 tags.

## ✨ Features

* Upload MP3 files directly from your browser
* View existing metadata tags
* Edit song information:

  * Title
  * Artist
  * Album
  * Genre
  * Year
  * Track Number
* Update album artwork (cover image)
* Download the updated audio file with modified tags
* Simple and user-friendly interface

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* node-id3
* Multer (file uploads)

## 📂 Project Structure

```
MP3-TagEditor/
│
├── client/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── server/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js (v18+ recommended)
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/atharv170705/MP3-TagEditor.git
cd MP3-TagEditor
```

Install dependencies:

```bash
npm install
```

### Running the Application

Start the backend server:

```bash
npm run server
```

Start the frontend:

```bash
npm run client
```

Or run both simultaneously (if configured):

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

## 📸 How It Works

1. Upload an MP3 file.
2. The application reads its existing ID3 tags.
3. Modify any metadata fields you want.
4. Save the changes.
5. Download the updated MP3 file.

## 📦 Core Package

This project uses the excellent **node-id3** library for manipulating ID3 metadata tags.

Example:

```javascript
import NodeID3 from "node-id3";

NodeID3.update(
  {
    title: 'My Song',
    artist: 'Artist Name',
    album: 'Album Name'
  },
  audioPath
);
```


