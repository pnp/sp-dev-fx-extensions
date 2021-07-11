import * as React from 'react';
import { mergeStyles, mergeStyleSets, } from '@fluentui/react';
import { AppContext } from '../../common/AppContext';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export var useConfigurationListStyles = function () {
    var _a = React.useContext(AppContext), theme = _a.theme, context = _a.context;
    var panelContainerStyles = {
        root: {
            paddingTop: 20,
            paddingBottom: 30,
        }
    };
    var stackItemsContainer = {
        root: { paddingTop: 15, maxHeight: "calc(100vh - 450px)", overflow: 'auto' }
    };
    var documentCardStyles = {
        root: {
            marginTop: 5,
            ':hover': {
                borderColor: theme.themePrimary,
                borderWidth: 1,
            }
        },
    };
    var configurationListClasses = mergeStyleSets({
        listIcon: mergeStyles({
            fontSize: 18, width: 18, height: 18, color: theme.themePrimary
        }),
        nolistItemIcon: mergeStyles({
            fontSize: 28, width: 28, height: 28, color: theme.themePrimary
        }),
    });
    return { configurationListClasses: configurationListClasses, documentCardStyles: documentCardStyles, panelContainerStyles: panelContainerStyles, stackItemsContainer: stackItemsContainer };
};
//# sourceMappingURL=useConfigurationListStyles.js.map