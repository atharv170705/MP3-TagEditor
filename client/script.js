document.addEventListener("DOMContentLoaded", () => {
    const uploadAudioPage = document.getElementById("upload-audio-page");
    const audioInput = document.getElementById("audio-input");
    const audioInputTextArea = document.getElementById("audio-input-text-area");
    const uploadAudioBtn = document.getElementById("upload-audio-btn");
    const tagEditorForm = document.getElementById("tag-editor-form");
    const albumArtInput = document.getElementById("album-art");
    const albumArtPreview = document.getElementById("album-art-preview");
    const titleInput = document.getElementById("title");
    const artistInput = document.getElementById("artist");
    const albumArtistInput = document.getElementById("albumArtist");
    const albumInput = document.getElementById("album");
    const yearInput = document.getElementById("year");
    const trackNumberInput = document.getElementById("track-number");
    const saveBtn = document.getElementById("save-btn");
    const downloadPage = document.getElementById("download-page");
    const downloadBtn = document.getElementById("download-btn");
    const songTitleDisplay = document.getElementById("song-title-display");
    const uploadMoreBtn = document.getElementById("upload-more-btn");

    // const backendUrl = "http://localhost:3000";
    const backendUrl = "https://mp3-tageditor.onrender.com";

    let currentFileId = null;
    let filename = null;
    uploadAudioPage.classList.remove("hidden");
    downloadPage.classList.add("hidden");
    tagEditorForm.classList.add("hidden");

    audioInput.addEventListener("change", () => {
        const file = audioInput.files[0];
        if(!file) return;
        audioInputTextArea.innerText = `${file.name}`
    });
    
    uploadAudioBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const file = audioInput.files[0];
        if(!file) return;
        // console.log(file);
        try {
            const response = await uploadAudioFile(file);
            // console.log(response);
            const {fileId, tags} = response;
            currentFileId = fileId;
            uploadAudioPage.classList.add("hidden");
            downloadPage.classList.add("hidden");
            tagEditorForm.classList.remove("hidden");
        } catch (error) {
            console.error("Upload failed:" ,error);
        }
    });

    async function uploadAudioFile(file) {
        const formData = new FormData();
        formData.append("audio", file);
        const res = await axios.post(`${backendUrl}/api/upload`, formData);
        return res.data;
    }
    
    albumArtInput.addEventListener("change", () => {
        const file = albumArtInput.files[0];
        if(!file) return;
        albumArtPreview.src = URL.createObjectURL(file);
        albumArtPreview.classList.remove("hidden");
    });

    saveBtn.addEventListener("click", async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const fields = {
            albumArt: albumArtInput.files[0],
            title: titleInput.value.trim(),
            artist: artistInput.value.trim(),
            albumArtist: albumArtistInput.value.trim(),
            album: albumInput.value.trim(),
            year: yearInput.value,
            track: trackNumberInput.value,
        };
        if(Object.values(fields).some(v => !v)) return;

        try {
            const response = await saveTags(fields);
            // console.log(response);
            const {title} = response;
            filename = title;
            uploadAudioPage.classList.add("hidden");
            tagEditorForm.classList.add("hidden");
            downloadPage.classList.remove("hidden");
            songTitleDisplay.innerText = `${filename}.mp3`
        } catch (error) {
            console.error("Update failed:", error);
        }
    });

    async function saveTags(fields) {
        const formData = new FormData();
        formData.append("cover", fields.albumArt);
        formData.append("title", fields.title);
        formData.append("artist", fields.artist);
        formData.append("albumArtist", fields.albumArtist);
        formData.append("album", fields.album);
        formData.append("year", fields.year);
        formData.append("track", fields.track);

        const res = await axios.post(
            `${backendUrl}/api/update/${currentFileId}`,
            formData,
            {
                headers :{
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        return res.data;
    }

    downloadBtn.addEventListener("click", async () => {
        await downloadEditedAudio();
    })

    async function downloadEditedAudio() {
        try {
            const res = await axios.get(
                `${backendUrl}/api/download/${currentFileId}`,
                {
                    responseType: "blob",
                }
            );
            console.log("At the download function:", res.data);
            
            const url = window.URL.createObjectURL(res.data);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.mp3`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    }


    uploadMoreBtn.addEventListener("click", async () => {
        try {
            await axios.post(`${backendUrl}/api/cleanup`);
        } catch (error) {
            console.error("Backend cleanup failed:", error)
        }
        currentFileId = null;
        filename = null;

        audioInput.value = "";
        albumArtInput.value = "";
        albumArtPreview.src = "";
        albumArtPreview.classList.add("hidden");

        titleInput.value = "";
        artistInput.value = "";
        albumArtistInput.value = "";
        albumInput.value = "";
        yearInput.value = "";
        trackNumberInput.value = "";
        
        uploadAudioPage.classList.remove("hidden");
        downloadPage.classList.add("hidden");
        tagEditorForm.classList.add("hidden");
        
    })
});