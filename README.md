# temp


**Project Structure (Maven)**

```
my-app/
├─ pom.xml
└─ src/
   └─ main/
      ├─ java/
      │  └─ com/
      │     └─ yourcompany/
      │        └─ wordeditor/
      │           ├─ WordEditorController.java
      │           └─ WordProcessorHelper.java
      └─ resources/
         └─ application.properties
```

1. **pom.xml**

   * At the project root, add the Syncfusion repos & dependencies under `<project>` → `<repositories>` and `<dependencies>`.

2. **Controller**

   * Path: `src/main/java/com/yourcompany/wordeditor/WordEditorController.java`
   * Annotate with `@RestController` and put the `/Import` endpoint here.

3. **Helper**

   * Path: `src/main/java/com/yourcompany/wordeditor/WordProcessorHelper.java`
   * Static method to load the `.docx` and return SFDT JSON.

4. **Config**

   * `src/main/resources/application.properties` for any Syncfusion license keys or server settings.

That’s it—pom.xml at root, your Java packages under `src/main/java`, and resources under `src/main/resources`.
