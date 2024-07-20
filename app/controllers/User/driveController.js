const CLIENT_ID =
  '83794808376-gf5eqja1rh9beji8m10aldvrbe0vtu24.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const refresh_token =
  '1//04SakXfmnqWeCCgYIARAAGAQSNwF-L9IrbKzNtxEXaJeu5yAuhGsGNlUiNyQeBKbtmFxX0snrN1i-uU4BAShXLqkl08VuAuogFtk';

const { google } = require('googleapis');
const oauth2_client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oauth2_client.setCredentials({ refresh_token: refresh_token });
const drive = google.drive({ version: 'v3', auth: oauth2_client });
class DriveController {
  async SearchFolderWithName(nameFolder) {
    try {
      var response = await drive.files.list({
        q: `name contains "${nameFolder}"`,
      });
      return response.data.files;
    } catch (error) {
      console.log(error.message);
    }
  }
  async SearchFolderWithId_Folder(id_folder) {
    try {
      var response = await drive.files.list({
        q: `
            '${id_folder}' in parents 
            and 
            mimeType = 'application/vnd.google-apps.folder'`,
      });
      return response.data.files;
    } catch (error) {
      console.log(error.message);
    }
  }
  async SearchFolder_WithName_inFolder(nameFolder, folder) {
    var query = {
      q: `
        name contains '${nameFolder}'
        ${
          folder != null ? ` and '${folder.id}' in parents` : ''
        } and mimeType = 'application/vnd.google-apps.folder'
        `,
    };
    try {
      var response = await drive.files.list(query);
      return response.data.files[0];
    } catch (error) {
      console.log(error.message);
    }
  }
  async searchFolderWithPath(path) {
    var result;
    const arr_path = path.split('/');
    var folder_parent = null;
    result = Promise.resolve(
      await arr_path.map(async (folder, idx) => {
        if (idx == arr_path.length - 1) {
          folder_parent =
            await new DriveController().SearchFolder_WithName_inFolder(
              arr_path[idx],
              folder_parent,
            );
          // console.log(folder_parent);
          return folder_parent;
        } else {
          folder_parent =
            await new DriveController().SearchFolder_WithName_inFolder(
              arr_path[idx],
              folder_parent,
            );
        }
      })[arr_path.length - 1],
    );
    //  console.log(result);
    return result;
  }
  async uploadFile({ bufferStream, name, mineType, idFolderParent }) {
    try {
      var res = await drive.files.create({
        resource: {
          name: name,
          parents: idFolderParent,
        },
        media: {
          mimeType: mineType,
          body: bufferStream,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  }
  async createFolder({ name, idFolderParent }) {
    console.log(idFolderParent);
    try {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [idFolderParent],
      };
      var res = await drive.files.create({
        resource: fileMetadata,
        // fields: idFolderParent,
      });
      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  }
  async deleteFile({ fileID }) {
    console.log(fileID);
    try {
      var res = await drive.files.delete({
        fileId: fileID,
      });
      return res;
    } catch (error) {
      console.log(error.message);
    }
  }
}

module.exports = new DriveController();
