import { mergeStyles, mergeStyleSets } from "office-ui-fabric-react/lib/Styling";
var theme = window.__themeState__.theme;
export var useListPickerStyles = function (themeVariant) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26;
    var textHeaderStyles = {
        root: { color: (_a = theme) === null || _a === void 0 ? void 0 : _a.themePrimary },
    };
    var iconStyles = { root: { width: 18, height: 18, fontSize: 18 } };
    var renderIconButtonRemoveStyles = {
        root: {
            height: 26,
            lineHeight: 26,
        },
    };
    var renderItemStylesMulti = {
        root: {
            height: 26,
            lineHeight: 26,
            paddingLeft: 10,
            marginLeft: 5,
            marginBottom: 5,
            cursor: "default",
            backgroundColor: (_d = (_c = (_b = themeVariant) === null || _b === void 0 ? void 0 : _b.palette) === null || _c === void 0 ? void 0 : _c.themeLighterAlt, (_d !== null && _d !== void 0 ? _d : theme.themeLighterAlt)),
            ":hover": {
                backgroundColor: theme.themeLighter,
            },
        },
    };
    var renderItemStylesSingle = {
        root: {
            height: 26,
            lineHeight: 26,
            paddingLeft: 10,
            cursor: "default",
            margin: 2,
            backgroundColor: (_g = (_f = (_e = themeVariant) === null || _e === void 0 ? void 0 : _e.palette) === null || _f === void 0 ? void 0 : _f.themeLighterAlt, (_g !== null && _g !== void 0 ? _g : theme.themeLighterAlt)),
            ":hover": {
                backgroundColor: (_k = (_j = (_h = themeVariant) === null || _h === void 0 ? void 0 : _h.palette) === null || _j === void 0 ? void 0 : _j.themeLighter, (_k !== null && _k !== void 0 ? _k : theme.themeLighter)),
            },
        },
    };
    var pickerStylesSingle = {
        root: {
            width: " 100%",
            borderRadius: 0,
            marginTop: 0,
        },
        input: {
            width: "100%",
            backgroundColor: (_o = (_m = (_l = themeVariant) === null || _l === void 0 ? void 0 : _l.palette) === null || _m === void 0 ? void 0 : _m.white, (_o !== null && _o !== void 0 ? _o : theme.white)),
        },
        itemsWrapper: {},
        text: {
            borderStyle: "solid",
            width: "100%",
            borderWidth: 1,
            backgroundColor: (_r = (_q = (_p = themeVariant) === null || _p === void 0 ? void 0 : _p.palette) === null || _q === void 0 ? void 0 : _q.white, (_r !== null && _r !== void 0 ? _r : theme.white)),
            borderRadius: 0,
            borderColor: (_u = (_t = (_s = themeVariant) === null || _s === void 0 ? void 0 : _s.palette) === null || _t === void 0 ? void 0 : _t.neutralQuaternaryAlt, (_u !== null && _u !== void 0 ? _u : theme.neutralQuaternaryAlt)),
            ":focus": {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: (_x = (_w = (_v = themeVariant) === null || _v === void 0 ? void 0 : _v.palette) === null || _w === void 0 ? void 0 : _w.themePrimary, (_x !== null && _x !== void 0 ? _x : theme.themePrimary)),
            },
            ":hover": {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: (_0 = (_z = (_y = themeVariant) === null || _y === void 0 ? void 0 : _y.palette) === null || _z === void 0 ? void 0 : _z.themePrimary, (_0 !== null && _0 !== void 0 ? _0 : theme.themePrimary)),
            },
            ":after": {
                borderWidth: 0,
                borderRadius: 0,
            },
        },
    };
    var pickerStylesMulti = {
        root: {
            width: " 100%",
            borderRadius: 0,
        },
        input: {
            width: "100%",
            backgroundColor: (_3 = (_2 = (_1 = themeVariant) === null || _1 === void 0 ? void 0 : _1.palette) === null || _2 === void 0 ? void 0 : _2.white, (_3 !== null && _3 !== void 0 ? _3 : theme.white)),
        },
        itemsWrapper: {
            padding: 3,
        },
        text: {
            borderStyle: "solid",
            width: "100%",
            borderWidth: 1,
            backgroundColor: (_6 = (_5 = (_4 = themeVariant) === null || _4 === void 0 ? void 0 : _4.palette) === null || _5 === void 0 ? void 0 : _5.white, (_6 !== null && _6 !== void 0 ? _6 : theme.white)),
            borderRadius: 0,
            borderColor: (_9 = (_8 = (_7 = themeVariant) === null || _7 === void 0 ? void 0 : _7.palette) === null || _8 === void 0 ? void 0 : _8.neutralQuaternaryAlt, (_9 !== null && _9 !== void 0 ? _9 : theme.neutralQuaternaryAlt)),
            ":focus": {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: (_12 = (_11 = (_10 = themeVariant) === null || _10 === void 0 ? void 0 : _10.palette) === null || _11 === void 0 ? void 0 : _11.themePrimary, (_12 !== null && _12 !== void 0 ? _12 : theme.themePrimary)),
            },
            ":hover": {
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: (_15 = (_14 = (_13 = themeVariant) === null || _13 === void 0 ? void 0 : _13.palette) === null || _14 === void 0 ? void 0 : _14.themePrimary, (_15 !== null && _15 !== void 0 ? _15 : theme.themePrimary)),
            },
            ":after": {
                borderStyle: "solid",
                borderWidth: 1,
                // borderColor: theme.neutralQuaternaryAlt,
                borderColor: (_18 = (_17 = (_16 = themeVariant) === null || _16 === void 0 ? void 0 : _16.palette) === null || _17 === void 0 ? void 0 : _17.themePrimary, (_18 !== null && _18 !== void 0 ? _18 : theme.themePrimary)),
            },
        },
    };
    var componentClasses = mergeStyleSets({
        eventCircleColor: mergeStyles({
            borderRadius: "50%",
            borderWidth: 3,
            borderStyle: "solid",
            padding: 10,
        }),
        separator: mergeStyles({
            marginTop: 25,
            marginLeft: 20,
            marginRight: 20,
            borderBottomWidth: 1,
            borderBottomColor: (_21 = (_20 = (_19 = themeVariant) === null || _19 === void 0 ? void 0 : _19.palette) === null || _20 === void 0 ? void 0 : _20.neutralQuaternaryAlt, (_21 !== null && _21 !== void 0 ? _21 : theme.neutralQuaternaryAlt)),
            borderBottomStyle: "solid",
        }),
        filePickerButtonStyles: mergeStyles({
            position: "relative",
            top: -15,
        }),
        iconStyles: {
            paddingLeft: 2,
            fontWeight: 500,
            color: (_24 = (_23 = (_22 = themeVariant) === null || _22 === void 0 ? void 0 : _22.palette) === null || _23 === void 0 ? void 0 : _23.themePrimary, (_24 !== null && _24 !== void 0 ? _24 : (_25 = theme) === null || _25 === void 0 ? void 0 : _25.themePrimary)),
        },
        iconStylesGlobeAndList: {
            width: 18,
            height: 18,
            fontSize: 18,
        },
        iconStylesWebUrl: {
            width: 22,
            height: 22,
            fontSize: 22,
        },
    });
    var stacklabelHoverItem = {
        root: {
            paddingTop: 15,
            paddingLeft: 15,
            paddingRight: 15,
            paddingBottom: 0,
            color: (_26 = themeVariant) === null || _26 === void 0 ? void 0 : _26.themePrimary,
        },
    };
    return {
        componentClasses: componentClasses,
        pickerStylesMulti: pickerStylesMulti,
        pickerStylesSingle: pickerStylesSingle,
        renderItemStylesSingle: renderItemStylesSingle,
        renderItemStylesMulti: renderItemStylesMulti,
        renderIconButtonRemoveStyles: renderIconButtonRemoveStyles,
        stacklabelHoverItem: stacklabelHoverItem,
    };
};
//# sourceMappingURL=ListPickerStyles.js.map