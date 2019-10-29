## react-command-generate-documents

This project contains an azure function that can populate a word template stored in a document library with information passed into it in the post body. The azure function can save the generated document back to another SharePoint document library. The function impersonates the logged in user to ensure that the function only can write to libraries the caller has access to. It can also create a PDF version of the file using the  v2.0 SharePoint rest interface. 
A sample SPFX list view command set is also included to demonstrate how to call the azure function passing in data from multiple lists in a site.


### Building the code

Build and install instructions for both the azure function and the spfx extension  can be found in the file at misc/Gernerating a word.docx





