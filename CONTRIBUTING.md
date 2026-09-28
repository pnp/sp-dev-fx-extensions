# Contribution Guidance

If you'd like to contribute to this repository, please read the following guidelines. Contributors are more than welcome to share their learnings with others from a centralized location.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Question or Problem?

Please do not open GitHub issues for general support questions as the GitHub list should be used for feature requests and bug reports. This way we can more easily track actual issues or bugs from the code and keep the general discussion separate from the actual code.

If you have questions about how to use the SharePoint Framework or any of the provided samples, please use the following locations.

* [SharePoint Developer Space](http://aka.ms/SPPnP-Community) at http://techcommunity.microsoft.com
* [SharePoint Stack Exchange](http://sharepoint.stackexchange.com/) with 'spfx' tag

## Typos, Issues, Bugs and contributions

Whenever you are submitting any changes to the SharePoint repositories, please follow these recommendations.

* Always fork repository to your own account for applying modifications
* Do not combine multiple changes in one pull request. For example, please submit any samples and documentation updates using separate PRs
* If you are submitting multiple samples, please create specific PR for each of them

## Sample Naming and Structure Guidelines

When you submit a new sample, please follow these guidelines:

* Each sample must be placed in a folder under the `samples` folder
* Your sample folder must include the following content:
    - Your solution's source code
    - An `.nvmrc` file declaring the required Node.js version
    - An `assets` folder containing screenshots and an `assets/sample.json` metadata file
    - A `README.md` file at the root of the sample folder
* You must only submit samples for which you have the rights to share. Make sure that you asked for permission from your employer and/or clients before committing the code to an open-source repository, because once you submit a pull request, the information is public and _cannot be removed_.

### Sample Folder

* When submitting a new sample solution, please name the sample solution folder accordingly
* Folder should start by identifying JS library used - like `react-`, `angular-`, `knockout-`
* If you are not using any specific JS library, please use `js-` as the prefix for your sample
  * Do not use words "sample"or "extension" in the folder or sample name - these are samples for client-side extensions repository
* If your solution is demonstrating multiple technologies, please use functional terms as the name for the solution folder
* Do not use period/dot in the folder name of the provided sample

### Source Code Only

* For security reasons, we do not accept pull requests containing `.sppkg` files. We only accept source code files for applications.
* Make sure to place the root of your solution's source code in the sample folder.
* Do not commit generated or dependency files such as `node_modules`, `lib`, or `upgrade-report.md`.

### .nvmrc

* Include an `.nvmrc` file at the root of the sample folder so contributors can use the Node.js version required by the sample.

### AI-assisted contributions

AI-assisted development is welcome -- and encouraged. However, contributors are responsible for ensuring that every sample is accurate, complete, well-tested, and does what it claims to do. Pull requests containing unreviewed AI-generated code, hallucinated implementations, placeholder content, or samples that do not function as described will be rejected.

### README.md

* You will need to have a `README.md` file for your contribution, which is based on [the provided template](./templates/README-template.md). Please copy this template to the root of your sample folder and update it accordingly. Your `README.md` must be named exactly `README.md` -- with capital letters -- as this is the information we use to make your sample public.
* You will need to have a screenshot picture of your sample in action in the `README.md` file ("pics or it didn't happen"). The preview image must be located in the `assets` folder in the root of your sample folder.
    * All screen shots must be located in the `assets` folder. Do not point to your own repository or any other external source
* If you find an existing sample which is similar to yours, please extend the existing one rather than submitting a new similar sample
  * When you update existing samples, please update also `README.md` file accordingly with information on provided changes and with your author details
* Make sure to document each function in the `README.md`
* If you include your social media information under **Authors** in the **Solution** section, we'll use this information to promote your contribution on social media, blog posts, and community calls.
    * Try to use the following syntax:
    ```md
    folder name | Author Name ([@yourtwitterhandle](https://twitter.com/yourtwitterhandle))
    ```
* If you include your company name after your name, we'll try to include your company name in blog posts and community calls.
    * Try to use the following syntax:
    ```md
    folder name | Author Name ([@yourtwitterhandle](https://twitter.com/yourtwitterhandle)), Company Name
    ```
* For multiple authors, please provide one line per author
* If you prefer to not use social media or disclose your name, we'll still accept your sample, but we'll assume that you don't want us to promote your contribution on social media.

#### Visitor stats image

Every sample-root `README.md` must use the following visitor stats image as its final non-empty line:

```html
<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/{sample-path}" />
```

Replace `{sample-path}` with the path to the sample folder relative to the repository root, using forward slashes and no leading or trailing slash. For example, `samples/react-todo` produces:

```html
<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-extensions/samples/react-todo" />
```

### Assets

* To help people make sense of your sample, make sure to always include at least one screenshot of your solution in action. People are more likely to click on a sample if they can preview it before installing it.
* Please provide a high-quality screenshot
* If possible, use a resolution of **1920x1080**
* You can add as many screen shots as you'd like to help users understand your sample without having to download it and install it.
* You can include animated images (such as `.gif` files), but you must provide at least one static `.png` file

### Sample metadata

* Include `assets/sample.json` for every sample and keep its title, description, products, technologies, thumbnails, authors, and repository URLs consistent with the sample-root `README.md`.
* Metadata URLs and thumbnail paths must point to this repository and the sample's repository-relative path.

## Submitting Pull Requests

> If you aren't familiar with how to contribute to open-source repositories using GitHub, or if you find the instructions on this page confusing, [sign up](https://forms.office.com/Pages/ResponsePage.aspx?id=KtIy2vgLW0SOgZbwvQuRaXDXyCl9DkBHq4A2OG7uLpdUREZVRDVYUUJLT1VNRDM4SjhGMlpUNzBORy4u) for one of our [Sharing is Caring](https://pnp.github.io/sharing-is-caring/#pnp-sic-events) events. It's completely free, and we'll guide you through the process.

Here's a high-level process for submitting new samples or updates to existing ones.

1. Sign the Contributor License Agreement (see below)
2. Fork this repository [pnp/sp-dev-fx-extensions](https://github.com/pnp/sp-dev-fx-extensions) to your GitHub account
3. Create a new branch from the `main` branch for your fork for the contribution
4. Include your changes to your branch
5. Commit your changes using a descriptive commit message. These are used to track changes for monthly communications
6. Push the branch to your fork and create a pull request targeting the `main` branch of `pnp/sp-dev-fx-extensions`
7. Fill out the provided PR template with the requested details

Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/pnp/sp-dev-fx-extensions/pulls) for an open or closed pull request
  that relates to your submission. You don't want to duplicate effort.
* Make sure you have a link in your local cloned fork to the [pnp/sp-dev-fx-extensions](https://github.com/pnp/sp-dev-fx-extensions):

  ```shell
  # check if you have a remote pointing to the Microsoft repo:
  git remote -v

  # if you see a pair of remotes (fetch and push) that point to https://github.com/pnp/sp-dev-fx-extensions, you're set; otherwise add one

  # add a new remote named "upstream" and point to the Microsoft repo
  git remote add upstream https://github.com/pnp/sp-dev-fx-extensions.git
  ```

* Make your changes in a new git branch:

  ```shell
  git switch -c react-field-slider main
  ```

* Ensure your fork is updated and not behind the upstream **sp-dev-fx-extensions** repo. Refer to these resources for more information on syncing your repo:
  * [GitHub Docs: Syncing a fork](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)
  * For a quick cheat sheet:

    ```shell
    # assuming you are in the folder of your locally cloned fork....
    git switch main

    # assuming you have a remote named `upstream` pointing official **sp-dev-fx-extensions** repo
    git fetch upstream

    # update your local main to be a mirror of what's in the main repo
    git pull --rebase upstream main

    # switch to your branch where you are working, say "react-field-slider"
    git switch react-field-slider

    # update your branch to update it's fork point to the current tip of main & put your changes on top of it
    git rebase main
    ```

* Push your branch to GitHub:

  ```shell
  git push -u origin react-field-slider
  ```

## Merging your Existing GitHub Projects with this Repository

If the sample you wish to contribute is stored in your own GitHub repository, you can use the following steps to merge it with this repository:

* Fork the `sp-dev-fx-extensions` repository from GitHub
* Create a local git repository

    ```shell
    md sp-dev-fx-extensions
    cd sp-dev-fx-extensions
    git init
    ```

* Pull your forked copy of sp-dev-fx-extensions into your local repository

    ```shell
    git remote add origin https://github.com/yourgitaccount/sp-dev-fx-extensions.git
    git pull origin main
    ```

* Pull your other project from GitHub into the samples folder of your local copy of `sp-dev-fx-extensions`

    ```shell
    git subtree add --prefix=samples/projectname https://github.com/yourgitaccount/projectname.git main
    ```

* Push the changes up to your forked repository

    ```shell
    git push -u origin react-field-slider
    ```

## Signing the CLA

Before we can accept your pull requests you will be asked to sign electronically Contributor License Agreement (CLA), which is a pre-requisite for any contributions to any PnP repository. This will be a one time process, so for any future contributions you will not be asked to re-sign anything. After the CLA has been signed, our PnP core team members will have a look on your submission for final verification of the submission. Please do not delete your development branch until the submission has been closed.

You can find Microsoft CLA from the following address - https://cla.microsoft.com. 

Thank you for your contribution.

> Sharing is caring.
