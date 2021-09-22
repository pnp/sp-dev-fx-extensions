declare interface ICopyMoveItemsCommandSetStrings {
    CopyMoveCommand: string;
    UnkCmd: string;
    DialogTitle: string;
    CloseAL: string;
    DDLListLabel: string;

    Msg_Loading: string;
    Msg_Load_Flds: string;
    Msg_Wait: string;
    Msg_Cpy_Success: string;
    Msg_Cpy_Failed: string;
    Msg_Mve_Success: string;
    Msg_Mve_Failed: string;
    Msg_Fld_No_Match: string;
    Msg_Fld_Map_Twce: string;
    Msg_Fld_No_Map: string;
    Msg_Fld_Mul_Map: string;
    Msg_Fld_Atl_One: string;
    Msg_Fld_Map_Req: string;
    Msg_Fld_Dest_Req: string;

    Lbl_Src_Header: string;
    Lbl_Src_Item_Cnt: string;
    Lbl_Src_Sel_Item_Cnt: string;
    Lbl_Dest_Header: string;
    Lbl_Dest_Item_Cnt: string;
    Lbl_FldMap_Src_Header: string;
    Lbl_FldMap_Dest_Header: string;

    Btn_Cpy_Name: string;
    Btn_Mve_Name: string;
    Btn_ConMap_Name: string;
    Btn_Can_Name: string;
    Btn_Conf_Name: string;
}

declare module 'CopyMoveItemsCommandSetStrings' {
    const strings: ICopyMoveItemsCommandSetStrings;
    export = strings;
}
