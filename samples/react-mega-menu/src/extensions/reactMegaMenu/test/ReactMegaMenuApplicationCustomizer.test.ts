/**
 * @jest-environment jsdom
 */

import React from 'react';
import { configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import MegaMenuComponent from "../components/MegaMenuComponent";
import { MenuFakeProvider } from "../menuProvider/mockIndex";
configure({testIdAttribute: 'data-id'})
jest.useFakeTimers();

/**
 * Test the initial state i.e. button visible, menu invisible.
 */

describe("ReactMegaMenuApplicationCustomizer menu closed", () => {

  let menuProviderStub: jest.SpyInstance;
  let componentDidMountSpy: jest.SpyInstance;

  /**
   * BeforeAll hook.
   */
  beforeAll(() => {

    // add spy on the did mount event.
    componentDidMountSpy = jest.spyOn(MegaMenuComponent.prototype, "componentDidMount");

    // stub the menu provider so we use fake data to test.
    menuProviderStub = jest.spyOn(MenuFakeProvider.prototype, "getAllItems");
    
  });

  it("should button be visible", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))

    const menuButton1: HTMLElement | null = document.querySelector("button.menuButton");
    expect(menuButton1).toBeInTheDocument();
  });

  it("should menu element be null", () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
    const menu: HTMLElement | null = document.querySelector("div[data-id='menuPanel']");
    expect(menu).not.toBeInTheDocument();
  });

  it("should initial state be null", () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
    expect(document.querySelector("is-open")).not.toBeInTheDocument();
    expect(document.querySelector("menuItem")).not.toBeInTheDocument();
  });

  it("should componentDidMount and menuProvider.getAllItems be called after 50 milisecs", (done) => {

      render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
      jest.advanceTimersByTime(50);
      expect(componentDidMountSpy).toHaveBeenCalled();
      expect(menuProviderStub).toHaveBeenCalled();

      done();

  });
  
});

describe("ReactMegaMenuApplicationCustomizer menu opened", () => {

  /**
   * BeforeAll hook.
   */
  beforeAll(() => {
    // add spy on the did mount event.
    //componentDidMountSpyOpen = jest.spyOn(MegaMenuComponent.prototype, "componentDidMount");
    // stub the menu provider so we use fake data to test.
    //menuProviderStubOpen = jest.spyOn(MenuFakeProvider.prototype, "getAllItems").mockImplementation(() => fakeMenuData);
  });

  /**
   * At that stage the menu is open so let's verify
   * that some stuff exist on the newly loaded panel
   * with menu categories and items.
   * We cant use enzyme to find html element since the panel is outside of our react component,
   * therefore go back to vanila JavaScript element selectors.
   */

  it("should menu be visible", () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
    const menu: HTMLElement | null = document.querySelector("button[data-id='menuButton']");
    expect(menu).toBeInTheDocument();
  });

  it("should showPanel state changed to true", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }));

    const buttonCheck = screen.getByRole('button');
    expect(buttonCheck).toBeInTheDocument();

    fireEvent(
      screen.getByRole('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
      }),
    )
    
    expect(document.querySelector(".is-open")).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector("div[class='menuItem']")).toBeInTheDocument();

    }, {timeout: 60000});
    
  });

   it("should has rendered just fourteen menu category elements", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
    
    fireEvent(
      screen.getByRole('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
      }),
    )
    
    await waitFor(() => {
      const menuCategories: NodeListOf<HTMLElement> = document.querySelectorAll(".categoryItem");

      expect(menuCategories.length).toEqual(14);
    }, {timeout: 60000});
    
  });

  it("should has rendered just three menu item elements", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }));

    fireEvent(
      screen.getByRole('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
      }),
    )

    await waitFor(() => {
      const menuItems: NodeListOf<HTMLElement> = document.querySelectorAll(".menuItem");
      expect(menuItems.length).toEqual(171);
    }, {timeout: 60000});
    
  });

  it("verify Department of Finance category and items", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }))
    
    fireEvent(
      screen.getByRole('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
      }),
    )

    await waitFor(() => {
      const category: HTMLElement | null = document.querySelector("[data-id='Department of Finance']");

      const categoryText: string = category.querySelector("[class*='categoryItem']").innerHTML;
      const economicText: string = (category.querySelector("[data-id='5'] a") as HTMLAnchorElement).text;
      const bankingText: NodeListOf<HTMLElement> = category.querySelectorAll("[data-id='5'] a");
      const bankingNodeList = (bankingText[4] as HTMLAnchorElement).text;

      expect(categoryText).toEqual("Department of Finance");
      expect(economicText).toEqual("Economic");
      expect(bankingNodeList).toEqual("Banking");
    }, {timeout: 60000});
    
  });

  it("verify Department of Education and Skills category and items", async () => {
    render(React.createElement(MegaMenuComponent, { menuProvider: new MenuFakeProvider() }));

    fireEvent(
      screen.getByRole('button'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
      }),
    )

    await waitFor(() => {
      const category: HTMLElement | null = document.querySelector("[data-id='Department of Education and Skills']");
      const categoryText: string = category.querySelector("[class*='categoryItem']").innerHTML;
      const categoryChildren  = category.childElementCount;
      expect(categoryText).toEqual("Department of Education and Skills");
      expect(categoryChildren).toBeGreaterThan(1);
    }, {interval: 1000, timeout: 60000});
  });


});