import * as fs from 'fs';
import * as xlsx from 'xlsx';

import {
  query,
  update,
  StableBTreeMap,
  Vec,
  Opt,
  None,
  text,
  Void,
  Canister,
  ic,
} from "azle";
import { v4 as uuidv4 } from "uuid";

import {
  Artist,
  ArtistPayload,
  User,
  UserPayload,
  Manager,
  ManagerPayload,
  Song,
  SongPayload,
  ArtistId,
  UserId,
  ManagerId,
  SongId,
  LogsheetId,
  Logsheet,
  LogsheetPayload,
} from "./types";

let artists = StableBTreeMap<ArtistId, Artist>(text, Artist, 0);
let users = StableBTreeMap<UserId, User>(text, User, 1);
let managers = StableBTreeMap<ManagerId, Manager>(text, Manager, 2);
let songs = StableBTreeMap<SongId, Song>(text, Song, 3);
let logsheets = StableBTreeMap<LogsheetId, Logsheet>(text, Logsheet, 6);
let matchedSongs = StableBTreeMap<LogsheetId, Song>(text, Song, 5);

export default Canister({
  // Register Artist
  addArtist: update([ArtistPayload], Artist, (payload) => {
    let artist: Artist = {
      id: uuidv4(),
      FullName: payload.FullName,
      Pseudoname: payload.Pseudoname,
      National_ID: payload.National_ID,
      Date_of_Birth: payload.Date_of_Birth,
      Nationality: payload.Nationality,
      Genre: payload.Genre,
      Phonenumber: payload.Phonenumber,
      Email: payload.Email,
    };

    artists.insert(artist.id, artist);
    return artist;
  }),

  // Register User
  addUser: update([UserPayload], User, (payload) => {
    let user: User = {
      id: uuidv4(),
      Name: payload.Name,
      Phonenumber: payload.Phonenumber,
      Email: payload.Email,
    };
    users.insert(user.id, user);
    return user;
  }),

  // Get all users
  getAllUsers: query([], Vec(Artist), () => {
    return artists.values();
  }),

  // Register Manager
  addManager: update([ManagerPayload], Manager, (payload) => {
    let manager: Manager = {
      id: uuidv4(),
      Name: payload.Name,
      Phonenumber: payload.Phonenumber,
      Email: payload.Email,
    };
    managers.insert(manager.id, manager);
    return manager;
  }),

  // Upload Music Details
  addSong: update([SongPayload], Song, (payload) => {
    let song: Song = {
      id: uuidv4(),
      Title: payload.Title,
      Composer: payload.Composer,
      ArtistId: payload.ArtistId,
      PlayCount: 0n,
    };

    songs.insert(song.id, song);
    return song;
  }),

  // View all songs
  getAllSongs: query([], Vec(Song), () => {
    return songs.values();
  }),

  addLogsheet: update([LogsheetPayload], Logsheet, (payload) => {
    let logsheet: Logsheet = {
      id: uuidv4(),
      createdAt: payload.createdAt,
      createdBy:payload.createdBy,
      SongTitle:payload.SongTitle,
      NumberOfPlays:payload.NumberOfPlays,
      Composer: payload.Composer,
    };

    logsheets.insert(logsheet.id, logsheet);
    return logsheet;
  }),
  
  // matching Songs function
// Uploading Logsheets
  uploadLogsheets: update([Vec<LogsheetPayload>], text, (logsheetData) => {
    try {
      processLogsheets(logsheetData);
      return 'Logsheets processed and stored successfully.';
    } catch (error) {
      console.error('Error processing logsheets:', error);
      return 'Error processing logsheets.';
    }
  }),

  // Temporary function to process logsheets
  processLogsheets: update([Vec<LogsheetPayload>], LogsheetPayload, (logsheetData) => {
    logsheetData.forEach((payload) => {
      let logsheet: Logsheet = {
        id: uuidv4(),
        createdAt: ic.time(),
        createdBy: payload.createdBy,
        SongTitle: payload.SongTitle,
        NumberOfPlays: payload.NumberOfPlays,
        Composer: payload.Composer,
      };

      logsheets.insert(logsheet.id, logsheet);
      matchLogsheetsWithSongs(logsheet);
    });
  }),

  // Match Logsheets with Songs
  matchLogsheetsWithSongs: update([Logsheet], text, (logsheet) => {
    const matchingSong = songs.values().find(
      (song) => song.Title === logsheet.SongTitle && song.Composer === logsheet.Composer
    );

    if (matchingSong) {
      matchingSong.NumberOfPlays += logsheet.NumberOfPlays;
      // Update the song in the map
      songs.insert(matchingSong.id, matchingSong);
      return 'Matched logsheet with song successfully.';
    } else {
      console.error('No matching song found for logsheet:', logsheet);
      return 'No matching song found for logsheet.';
    }
  }),

  // View Dashboard
  getArtistDashboard: query([ArtistId], Vec<Song>, (artistId) => {
    const artistSongs = songs.values().filter((song) => song.ArtistId === artistId);
    return artistSongs;
  }),



// Upload Logsheets
 
  
  // Get Song Statistics for an Artist
  
  
      // Increment play count for the associated song


  });

// Handle unmatched songs
// Calculate royalties
// View allocated royalties
// Artist portal that views their royalties
// Generate reports
  

 /* // Uploading Logsheets
  uploadExcelFile: update([text], text, (filePath) => {
    try {
      processExcelFile(filePath);
      return 'Data processed and stored successfully.';
    } catch (error) {
      console.error('Error processing Excel file:', error);
      return 'Error processing Excel file.';
    }
  }),
});

function processExcelFile(filePath: text): void {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(sheet) as Logsheet[];

  processLogsheetData(data);
}

function processLogsheetData(data: Logsheet[]): void {
  data.forEach((logsheetData) => {
    let logsheetId = uuidv4();
    logsheets.set(logsheetId, logsheetData);
  });

  */


