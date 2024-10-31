import { SPFI } from "@pnp/sp";
import { Constants } from "./Constants";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

export class SharePointService {
  private _sp: SPFI;
  private _listTitle: string;
  private _itemId: number;
  private _currentUserId: number;

  constructor(sp: SPFI, listTitle: string, itemId: number) {
    this._sp = sp;
    this._listTitle = listTitle;
    this._itemId = itemId;

    this._sp.web.currentUser().then((user) => {
      this._currentUserId = user.Id;
    }).catch((error) => {
      console.log(error);
    });
  }

  public async getCurrentUserId(): Promise<number> {
    if (this._currentUserId) return this._currentUserId;
    const currentUser = await this._sp.web.currentUser();
    return currentUser.Id;
  }

  public async getVoters(): Promise<number[]> {
    try {
      const item = await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .select(Constants.INTERNAL_COLUMN_NAME + 'Id')();
      const voters = item[Constants.INTERNAL_COLUMN_NAME + 'Id'];
      return voters || [];
    } catch (error) {
      console.log(error);
      alert("Failed to get voters value.");
      return [];
    }
  }

  public async addVote(): Promise<void> {
    try {
      const voters = await this.getVoters();
      // Ensure current user is not voted yet;
      if (voters && voters.indexOf(this._currentUserId) !== -1) return;

      const newVoters = [...voters, this._currentUserId];
      await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .update({
          [Constants.INTERNAL_COLUMN_NAME + 'Id']: newVoters,
        });
    } catch (error) {
      console.log(error);
      alert("Failed to add vote.");
    }
  }

  public async removeVote(): Promise<void> {
    try {
      const voters = await this.getVoters();
      // Ensure current user is voted;
      if (voters && voters.indexOf(this._currentUserId) === -1) return;

      const newVoters = voters.filter((voter) => voter !== this._currentUserId);
      await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .update({
          [Constants.INTERNAL_COLUMN_NAME + 'Id']: newVoters,
        });
    } catch (error) {
      console.log(error);
      alert("Failed to remove vote.");
    }
  }
}
