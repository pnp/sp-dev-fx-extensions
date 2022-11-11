import { SPFI } from "@pnp/sp";
import { Constants } from "./Constants";

export class SharePointService {
  private _sp: SPFI;
  private _listTitle: string;
  private _loginName: string;
  private _itemId: number;

  constructor(sp: SPFI, listTitle: string, itemId: number, loginName: string) {
    this._sp = sp;
    this._listTitle = listTitle;
    this._itemId = itemId;
    this._loginName = loginName;
  }

  public async getVoters(): Promise<string[]> {
    try {
      const item = await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .select(Constants.INTERNAL_COLUMN_NAME)();
      const voters = item[Constants.INTERNAL_COLUMN_NAME];
      return voters ? JSON.parse(voters) : [];
    } catch (error) {
      alert("Failed to get voters value.");
      return [];
    }
  }

  public async addVote(): Promise<void> {
    try {
      const voters = await this.getVoters();
      // Ensure current user is not voted yet;
      if (voters && voters.indexOf(this._loginName) !== -1) return;

      const newVoters = [...voters, this._loginName];
      await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .update({
          [Constants.INTERNAL_COLUMN_NAME]: JSON.stringify(newVoters),
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
      if (voters && voters.indexOf(this._loginName) === -1) return;

      const newVoters = voters.filter((voter) => voter !== this._loginName);
      await this._sp.web.lists
        .getByTitle(this._listTitle)
        .items.getById(this._itemId)
        .update({
          [Constants.INTERNAL_COLUMN_NAME]: JSON.stringify(newVoters),
        });
    } catch (error) {
      alert("Failed to remove vote.");
    }
  }
}
