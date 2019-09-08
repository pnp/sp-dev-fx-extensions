# Upgrade project react-command-vision-api to v1.9.1

Date: 2019-9-1

## Findings

Following is the list of steps required to upgrade your project to SharePoint Framework version 1.9.1. [Summary](#Summary) of the modifications is included at the end of the report.

### FN001001 @microsoft/sp-core-library | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-core-library

Execute the following command:

```sh
npm i -SE @microsoft/sp-core-library@1.9.1
```

File: [./package.json](./package.json)

### FN001011 @microsoft/sp-dialog | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-dialog

Execute the following command:

```sh
npm i -SE @microsoft/sp-dialog@1.9.1
```

File: [./package.json](./package.json)

### FN001013 @microsoft/decorators | Required

Upgrade SharePoint Framework dependency package @microsoft/decorators

Execute the following command:

```sh
npm i -SE @microsoft/decorators@1.9.1
```

File: [./package.json](./package.json)

### FN001014 @microsoft/sp-listview-extensibility | Required

Upgrade SharePoint Framework dependency package @microsoft/sp-listview-extensibility

Execute the following command:

```sh
npm i -SE @microsoft/sp-listview-extensibility@1.9.1
```

File: [./package.json](./package.json)

### FN002001 @microsoft/sp-build-web | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-build-web

Execute the following command:

```sh
npm i -DE @microsoft/sp-build-web@1.9.1
```

File: [./package.json](./package.json)

### FN002002 @microsoft/sp-module-interfaces | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-module-interfaces

Execute the following command:

```sh
npm i -DE @microsoft/sp-module-interfaces@1.9.1
```

File: [./package.json](./package.json)

### FN002003 @microsoft/sp-webpart-workbench | Required

Upgrade SharePoint Framework dev dependency package @microsoft/sp-webpart-workbench

Execute the following command:

```sh
npm i -DE @microsoft/sp-webpart-workbench@1.9.1
```

File: [./package.json](./package.json)

### FN002009 @microsoft/sp-tslint-rules | Required

Install SharePoint Framework dev dependency package @microsoft/sp-tslint-rules

Execute the following command:

```sh
npm i -DE @microsoft/sp-tslint-rules@1.9.1
```

File: [./package.json](./package.json)

### FN002011 @microsoft/rush-stack-compiler-2.9 | Required

Install SharePoint Framework dev dependency package @microsoft/rush-stack-compiler-2.9

Execute the following command:

```sh
npm i -DE @microsoft/rush-stack-compiler-2.9@0.7.16
```

File: [./package.json](./package.json)

### FN010001 .yo-rc.json version | Recommended

Update version in .yo-rc.json

In file [./.yo-rc.json](./.yo-rc.json) update the code as follows:

```json
{
  "@microsoft/generator-sharepoint": {
    "version": "1.9.1"
  }
}
```

File: [./.yo-rc.json](./.yo-rc.json)

### FN021001 main | Required

Add package.json property

In file [./package.json](./package.json) update the code as follows:

```json
{
  "main": "lib/index.js"
}
```

File: [./package.json](./package.json)

### FN012017 tsconfig.json extends property | Required

Update tsconfig.json extends property

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "extends": "./node_modules/@microsoft/rush-stack-compiler-2.9/includes/tsconfig-web.json"
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012014 tsconfig.json compiler options inlineSources | Required

Update tsconfig.json inlineSources value

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "inlineSources": false
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012015 tsconfig.json compiler options strictNullChecks | Required

Update tsconfig.json strictNullChecks value

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012016 tsconfig.json compiler options noUnusedLocals | Required

Update tsconfig.json noUnusedLocals value

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "noUnusedLocals": false
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN006003 package-solution.json isDomainIsolated | Required

Update package-solution.json isDomainIsolated

In file [./config/package-solution.json](./config/package-solution.json) update the code as follows:

```json
{
  "solution": {
    "isDomainIsolated": false
  }
}
```

File: [./config/package-solution.json](./config/package-solution.json)

### FN010007 .yo-rc.json isDomainIsolated | Recommended

Update isDomainIsolated in .yo-rc.json

In file [./.yo-rc.json](./.yo-rc.json) update the code as follows:

```json
{
  "@microsoft/generator-sharepoint": {
    "isDomainIsolated": false
  }
}
```

File: [./.yo-rc.json](./.yo-rc.json)

### FN002008 tslint-microsoft-contrib | Required

Install SharePoint Framework dev dependency package tslint-microsoft-contrib

Execute the following command:

```sh
npm i -DE tslint-microsoft-contrib@5.0.0
```

File: [./package.json](./package.json)

### FN012011 tsconfig.json compiler options outDir | Required

Update tsconfig.json outDir value

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "outDir": "lib"
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012012 tsconfig.json include property | Required

Update tsconfig.json include property

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "include": [
    "src/**/*.ts"
  ]
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012013 tsconfig.json exclude property | Required

Update tsconfig.json exclude property

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "exclude": [
    "node_modules",
    "lib"
  ]
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN015003 ./tslint.json | Required

Add file ./tslint.json

Execute the following command:

```sh
cat > ./tslint.json << EOF
{
  "rulesDirectory": [
    "tslint-microsoft-contrib"
  ],
  "rules": {
    "class-name": false,
    "export-name": false,
    "forin": false,
    "label-position": false,
    "member-access": true,
    "no-arg": false,
    "no-console": false,
    "no-construct": false,
    "no-duplicate-variable": true,
    "no-eval": false,
    "no-function-expression": true,
    "no-internal-module": true,
    "no-shadowed-variable": true,
    "no-switch-case-fall-through": true,
    "no-unnecessary-semicolons": true,
    "no-unused-expression": true,
    "no-use-before-declare": true,
    "no-with-statement": true,
    "semicolon": true,
    "trailing-comma": false,
    "typedef": false,
    "typedef-whitespace": false,
    "use-named-parameter": true,
    "variable-name": false,
    "whitespace": false
  }
}
EOF
```

File: [./tslint.json](./tslint.json)

### FN015004 ./config/tslint.json | Required

Remove file ./config/tslint.json

Execute the following command:

```sh
rm ./config/tslint.json
```

File: [./config/tslint.json](./config/tslint.json)

### FN015005 ./src/index.ts | Required

Add file ./src/index.ts

Execute the following command:

```sh
cat > ./src/index.ts << EOF
// A file is required to be in the root of the /src directory by the TypeScript compiler

EOF
```

File: [./src/index.ts](./src/index.ts)

### FN001007 @types/webpack-env | Required

Upgrade SharePoint Framework dependency package @types/webpack-env

Execute the following command:

```sh
npm i -SE @types/webpack-env@1.13.1
```

File: [./package.json](./package.json)

### FN001010 @types/es6-promise | Required

Install SharePoint Framework dependency package @types/es6-promise

Execute the following command:

```sh
npm i -SE @types/es6-promise@0.0.33
```

File: [./package.json](./package.json)

### FN002005 @types/chai | Required

Upgrade SharePoint Framework dev dependency package @types/chai

Execute the following command:

```sh
npm i -DE @types/chai@3.4.34
```

File: [./package.json](./package.json)

### FN002006 @types/mocha | Required

Upgrade SharePoint Framework dev dependency package @types/mocha

Execute the following command:

```sh
npm i -DE @types/mocha@2.2.38
```

File: [./package.json](./package.json)

### FN003001 config.json schema | Required

Update config.json schema URL

In file [./config/config.json](./config/config.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json"
}
```

File: [./config/config.json](./config/config.json)

### FN004001 copy-assets.json schema | Required

Update copy-assets.json schema URL

In file [./config/copy-assets.json](./config/copy-assets.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/copy-assets.schema.json"
}
```

File: [./config/copy-assets.json](./config/copy-assets.json)

### FN005001 deploy-azure-storage.json schema | Required

Update deploy-azure-storage.json schema URL

In file [./config/deploy-azure-storage.json](./config/deploy-azure-storage.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/deploy-azure-storage.schema.json"
}
```

File: [./config/deploy-azure-storage.json](./config/deploy-azure-storage.json)

### FN006001 package-solution.json schema | Required

Update package-solution.json schema URL

In file [./config/package-solution.json](./config/package-solution.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json"
}
```

File: [./config/package-solution.json](./config/package-solution.json)

### FN007001 serve.json schema | Required

Update serve.json schema URL

In file [./config/serve.json](./config/serve.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/serve.schema.json"
}
```

File: [./config/serve.json](./config/serve.json)

### FN009001 write-manifests.json schema | Required

Update write-manifests.json schema URL

In file [./config/write-manifests.json](./config/write-manifests.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/write-manifests.schema.json"
}
```

File: [./config/write-manifests.json](./config/write-manifests.json)

### FN010002 .yo-rc.json isCreatingSolution | Recommended

Update isCreatingSolution in .yo-rc.json

In file [./.yo-rc.json](./.yo-rc.json) update the code as follows:

```json
{
  "@microsoft/generator-sharepoint": {
    "isCreatingSolution": true
  }
}
```

File: [./.yo-rc.json](./.yo-rc.json)

### FN010003 .yo-rc.json packageManager | Recommended

Update packageManager in .yo-rc.json

In file [./.yo-rc.json](./.yo-rc.json) update the code as follows:

```json
{
  "@microsoft/generator-sharepoint": {
    "packageManager": "npm"
  }
}
```

File: [./.yo-rc.json](./.yo-rc.json)

### FN010004 .yo-rc.json componentType | Recommended

Update componentType in .yo-rc.json

In file [./.yo-rc.json](./.yo-rc.json) update the code as follows:

```json
{
  "@microsoft/generator-sharepoint": {
    "componentType": "webpart"
  }
}
```

File: [./.yo-rc.json](./.yo-rc.json)

### FN011003 List view command set manifest schema | Required

Update schema in manifest

In file [src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json](src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json) update the code as follows:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json"
}
```

File: [src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json](src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json)

### FN012001 tsconfig.json module | Required

Update module type in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "module": "esnext"
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012002 tsconfig.json moduleResolution | Required

Update moduleResolution in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN006002 package-solution.json includeClientSideAssets | Required

Update package-solution.json includeClientSideAssets

In file [./config/package-solution.json](./config/package-solution.json) update the code as follows:

```json
{
  "solution": {
    "includeClientSideAssets": true
  }
}
```

File: [./config/package-solution.json](./config/package-solution.json)

### FN012003 tsconfig.json skipLibCheck | Required

Update skipLibCheck in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012004 tsconfig.json typeRoots ./node_modules/@types | Required

Add ./node_modules/@types to typeRoots in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012005 tsconfig.json typeRoots ./node_modules/@microsoft | Required

Add ./node_modules/@microsoft to typeRoots in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@microsoft"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012006 tsconfig.json es6-collections types | Required

Remove es6-collections type in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "types": [
      "es6-collections"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012007 tsconfig.json es5 lib | Required

Add es5 lib in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "lib": [
      "es5"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012008 tsconfig.json dom lib | Required

Add dom lib in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "lib": [
      "dom"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN012009 tsconfig.json es2015.collection lib | Required

Add es2015.collection lib in tsconfig.json

In file [./tsconfig.json](./tsconfig.json) update the code as follows:

```json
{
  "compilerOptions": {
    "lib": [
      "es2015.collection"
    ]
  }
}
```

File: [./tsconfig.json](./tsconfig.json)

### FN013001 gulpfile.js ms-Grid sass suppression | Recommended

Add suppression for ms-Grid sass warning

In file [./gulpfile.js](./gulpfile.js) update the code as follows:

```js
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
```

File: [./gulpfile.js](./gulpfile.js)

### FN017001 Run npm dedupe | Optional

If, after upgrading npm packages, when building the project you have errors similar to: "error TS2345: Argument of type 'SPHttpClientConfiguration' is not assignable to parameter of type 'SPHttpClientConfiguration'", try running 'npm dedupe' to cleanup npm packages.

Execute the following command:

```sh
npm dedupe
```

File: [./package.json](./package.json)

## Summary

### Execute script

```sh
npm i -SE @microsoft/sp-core-library@1.9.1 @microsoft/sp-dialog@1.9.1 @microsoft/decorators@1.9.1 @microsoft/sp-listview-extensibility@1.9.1 @types/webpack-env@1.13.1 @types/es6-promise@0.0.33
npm i -DE @microsoft/sp-build-web@1.9.1 @microsoft/sp-module-interfaces@1.9.1 @microsoft/sp-webpart-workbench@1.9.1 @microsoft/sp-tslint-rules@1.9.1 @microsoft/rush-stack-compiler-2.9@0.7.16 tslint-microsoft-contrib@5.0.0 @types/chai@3.4.34 @types/mocha@2.2.38
cat > ./tslint.json << EOF
{
  "rulesDirectory": [
    "tslint-microsoft-contrib"
  ],
  "rules": {
    "class-name": false,
    "export-name": false,
    "forin": false,
    "label-position": false,
    "member-access": true,
    "no-arg": false,
    "no-console": false,
    "no-construct": false,
    "no-duplicate-variable": true,
    "no-eval": false,
    "no-function-expression": true,
    "no-internal-module": true,
    "no-shadowed-variable": true,
    "no-switch-case-fall-through": true,
    "no-unnecessary-semicolons": true,
    "no-unused-expression": true,
    "no-use-before-declare": true,
    "no-with-statement": true,
    "semicolon": true,
    "trailing-comma": false,
    "typedef": false,
    "typedef-whitespace": false,
    "use-named-parameter": true,
    "variable-name": false,
    "whitespace": false
  }
}
EOF
rm ./config/tslint.json
cat > ./src/index.ts << EOF
// A file is required to be in the root of the /src directory by the TypeScript compiler

EOF
```

### Modify files

#### [./.yo-rc.json](./.yo-rc.json)

Update version in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "version": "1.9.1"
  }
}
```

Update isDomainIsolated in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "isDomainIsolated": false
  }
}
```

Update isCreatingSolution in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "isCreatingSolution": true
  }
}
```

Update packageManager in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "packageManager": "npm"
  }
}
```

Update componentType in .yo-rc.json:

```json
{
  "@microsoft/generator-sharepoint": {
    "componentType": "webpart"
  }
}
```

#### [./package.json](./package.json)

Add package.json property:

```json
{
  "main": "lib/index.js"
}
```

#### [./tsconfig.json](./tsconfig.json)

Update tsconfig.json extends property:

```json
{
  "extends": "./node_modules/@microsoft/rush-stack-compiler-2.9/includes/tsconfig-web.json"
}
```

Update tsconfig.json inlineSources value:

```json
{
  "compilerOptions": {
    "inlineSources": false
  }
}
```

Update tsconfig.json strictNullChecks value:

```json
{
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

Update tsconfig.json noUnusedLocals value:

```json
{
  "compilerOptions": {
    "noUnusedLocals": false
  }
}
```

Update tsconfig.json outDir value:

```json
{
  "compilerOptions": {
    "outDir": "lib"
  }
}
```

Update tsconfig.json include property:

```json
{
  "include": [
    "src/**/*.ts"
  ]
}
```

Update tsconfig.json exclude property:

```json
{
  "exclude": [
    "node_modules",
    "lib"
  ]
}
```

Update module type in tsconfig.json:

```json
{
  "compilerOptions": {
    "module": "esnext"
  }
}
```

Update moduleResolution in tsconfig.json:

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

Update skipLibCheck in tsconfig.json:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

Add ./node_modules/@types to typeRoots in tsconfig.json:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types"
    ]
  }
}
```

Add ./node_modules/@microsoft to typeRoots in tsconfig.json:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@microsoft"
    ]
  }
}
```

Remove es6-collections type in tsconfig.json:

```json
{
  "compilerOptions": {
    "types": [
      "es6-collections"
    ]
  }
}
```

Add es5 lib in tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": [
      "es5"
    ]
  }
}
```

Add dom lib in tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": [
      "dom"
    ]
  }
}
```

Add es2015.collection lib in tsconfig.json:

```json
{
  "compilerOptions": {
    "lib": [
      "es2015.collection"
    ]
  }
}
```

#### [./config/package-solution.json](./config/package-solution.json)

Update package-solution.json isDomainIsolated:

```json
{
  "solution": {
    "isDomainIsolated": false
  }
}
```

Update package-solution.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json"
}
```

Update package-solution.json includeClientSideAssets:

```json
{
  "solution": {
    "includeClientSideAssets": true
  }
}
```

#### [./config/config.json](./config/config.json)

Update config.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/config.2.0.schema.json"
}
```

#### [./config/copy-assets.json](./config/copy-assets.json)

Update copy-assets.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/copy-assets.schema.json"
}
```

#### [./config/deploy-azure-storage.json](./config/deploy-azure-storage.json)

Update deploy-azure-storage.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/deploy-azure-storage.schema.json"
}
```

#### [./config/serve.json](./config/serve.json)

Update serve.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/serve.schema.json"
}
```

#### [./config/write-manifests.json](./config/write-manifests.json)

Update write-manifests.json schema URL:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/write-manifests.schema.json"
}
```

#### [src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json](src/extensions/imageCognitiveMetadata/ImageCognitiveMetadataCommandSet.manifest.json)

Update schema in manifest:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json"
}
```

#### [./gulpfile.js](./gulpfile.js)

Add suppression for ms-Grid sass warning:

```js
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
```
