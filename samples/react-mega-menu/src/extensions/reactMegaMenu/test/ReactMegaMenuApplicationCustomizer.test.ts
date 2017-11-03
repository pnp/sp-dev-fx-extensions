/// <reference types="mocha" />
/// <reference types="sinon" />

import * as React from "react";
import { expect } from "chai";
import { mount, ReactWrapper } from "enzyme";

import MegaMenuComponent from "../components/MegaMenuComponent";
import { IMegaMenuState } from "../components/IMegaMenuState";
import { IMegaMenuProps } from "../components/IMegaMenuProps";
import { IMenuProvider, MenuItem, MenuCategory, MenuSPListProvider } from "../menuProvider";

declare const sinon: sinon.SinonStatic;

mocha.timeout(0);

/**
 * Test the initial state i.e. button visible, menu invisible.
 */
describe("ReactMegaMenuApplicationCustomizer menu closed", () => {

  let reactComponent: ReactWrapper<IMegaMenuProps, IMegaMenuState>;
  let menuProviderStub: sinon.SinonStub;
  let componentDidMountSpy: sinon.SinonSpy;
  let fakeMenuData: Promise<MenuCategory[]> = new Promise<MenuCategory[]>((resolve, reject) => {
    resolve([
      {
        category: "Department of Finance",
        items: [
          { id: 1, name: "Economic", url: "https://Economic" },
          { id: 2, name: "Banking", url: "https://Banking" }
        ]
      },
      {
        category: "Department of Education and Skills",
        items: [
          { id: 3, name: "School Holidays", url: "https://Holidays" }
        ]
      }]);
  });

  /**
   * Before mocha hook.
   */
  before(() => {

    // add spy on the did mount event.
    componentDidMountSpy = sinon.spy(MegaMenuComponent.prototype, "componentDidMount");

    // stub the menu provider so we use fake data to test.
    menuProviderStub = sinon.stub(MenuSPListProvider.prototype, "getAllItems").returns(fakeMenuData);

    // mount the react component.
    reactComponent = mount(React.createElement(
      MegaMenuComponent,
      {
        menuProvider: new MenuSPListProvider("http://test.com")
      }
    ));
  });

  after(() => {
    componentDidMountSpy.restore();
    menuProviderStub.restore();
  });

  it("should button be visible", () => {

    let cssSelector: string = "[data-id='menuButton']";

    let menuButton: ReactWrapper<React.AllHTMLAttributes<{}>>;
    menuButton = reactComponent.find(cssSelector);

    expect(menuButton.length).to.be.greaterThan(0);
  });

  it("should menu element be null", () => {

    let menu: Element = document.querySelector("div[data-id='menuPanel']");

    expect(menu).to.be.equal(null);
  });

  it("should initial state be null", () => {

    expect(reactComponent.state().showPanel).to.be.equal(false);
    expect(reactComponent.state().menuItems.length).to.be.equal(0);
  });

  it("should componentDidMount and menuProvider.getAllItems be called after 50 milisecs", (done) => {
    setTimeout(() => {

      expect(componentDidMountSpy.calledOnce).to.be.equal(true);
      expect(menuProviderStub.calledOnce).to.be.equal(true);

      done();

    }, 50);
  });

  it("should has 2 menuItems in the menuItems state after 50 milisecs", (done) => {
    setTimeout(() => {

      expect(reactComponent.state().showPanel).to.be.equal(false);
      expect(reactComponent.state().menuItems.length).to.be.equal(2);

      done();

    }, 50);
  });
});

describe("ReactMegaMenuApplicationCustomizer menu opened", () => {

  let reactComponent: ReactWrapper<IMegaMenuProps, IMegaMenuState>;
  let menuProviderStub: sinon.SinonStub;
  let fakeMenuData: Promise<MenuCategory[]> = new Promise<MenuCategory[]>((resolve, reject) => {
    resolve([
      {
        category: "Department of Finance",
        items: [
          { id: 1, name: "Economic", url: "https://Economic" },
          { id: 2, name: "Banking", url: "https://Banking" }
        ]
      },
      {
        category: "Department of Education and Skills",
        items: [
          { id: 3, name: "School Holidays", url: "https://Holidays" }
        ]
      }]);
  });

  /**
   * Before mocha hook.
   */
  before((done) => {

    // stub the menu provider so we use fake data to test.
    menuProviderStub = sinon.stub(MenuSPListProvider.prototype, "getAllItems").returns(fakeMenuData);

    // mount the react component.
    reactComponent = mount(React.createElement(
      MegaMenuComponent,
      {
        menuProvider: new MenuSPListProvider("http://test.com")
      }
    ));

    let menuButton: ReactWrapper<React.AllHTMLAttributes<{}>>;
    menuButton = reactComponent.find("[data-id='menuButton']").first();

    menuButton.simulate("click"); // open the menu.

    setTimeout(done, 50); // all the menu items should be loaded after 200.
  });

  /**
   * At that stage the menu is open so let's verify
   * that some stuff exist on the newly loaded panel
   * with menu categories and items.
   * We cant use enzyme to find html element since the panel is outside of our react component,
   * therefore go back to vanila JavaScript element selectors.
   */
  it("should menu be visible", () => {

    let menu: Element = document.querySelector("div[data-id='menuPanel']");

    expect(menu).to.not.be.equal(null);
  });

  it("should showPanel state changed to true", () => {

    expect(reactComponent.state().showPanel).to.be.equal(true);
  });

  it("should has rendered just two menu category elements", () => {

    let menuCategories: NodeListOf<Element>;
    menuCategories = document.querySelectorAll("[class*='categoryItem']");

    expect(menuCategories.length).to.be.equal(2);
  });

  it("should has rendered just three menu item elements", () => {

    let menuItems: NodeListOf<Element>;
    menuItems = document.querySelectorAll("[class*='menuItem']");

    expect(menuItems.length).to.be.equal(3);
  });

  it("verify Department of Finance category and items", () => {

    let category: Element;
    category = document.querySelector("[data-id='Department of Finance']");

    let categoryText: string = category.querySelector("[class*='categoryItem']").innerHTML;
    let economicText: string = (category.querySelector("[data-id='1'] a") as HTMLAnchorElement).text;
    let bankingText: string = (category.querySelector("[data-id='2'] a") as HTMLAnchorElement).text;

    expect(categoryText).to.be.equal("Department of Finance");
    expect(economicText).to.be.equal("Economic");
    expect(bankingText).to.be.equal("Banking");
  });

  it("verify Department of Education and Skills category and items", () => {

    let category: Element;
    category = document.querySelector("[data-id='Department of Education and Skills']");

    let categoryText: string = category.querySelector("[class*='categoryItem']").innerHTML;
    let holidaysText: string = (category.querySelector("[data-id='3'] a") as HTMLAnchorElement).text;

    expect(categoryText).to.be.equal("Department of Education and Skills");
    expect(holidaysText).to.be.equal("School Holidays");
  });
});