import * as ReactDom from 'react-dom';

export enum ReactContainersTypes {
    CommandBar
}

export class ReactHelper {

    private static readonly _placeholderElementIdPrefix: string = 'lb-react-container-';

    public static injectContainerElement(containerType: ReactContainersTypes, parentElement: HTMLElement): HTMLElement {
        return ReactHelper.ensurePlaceholderContainer(containerType, parentElement);
    }

    public static clearReactContainerElementContent(containerType: ReactContainersTypes): void {
        const id: string = ReactHelper._placeholderElementIdPrefix + containerType.toString();
        ReactDom.unmountComponentAtNode(document.getElementById(id));
    }

    private static ensurePlaceholderContainer(type: ReactContainersTypes, rootContainer: HTMLElement): HTMLElement {
        const id: string = ReactHelper._placeholderElementIdPrefix + type.toString();

        let containerDiv: HTMLElement = rootContainer.querySelector(`#${id}`) as HTMLElement;
        if (!containerDiv) {
            containerDiv = document.createElement('div');
            containerDiv.setAttribute('id', id);

            rootContainer.appendChild(containerDiv);
        }

        return containerDiv;
    }
}