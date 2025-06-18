# temp
1. **Add Syncfusion Java libraries** (in your `pom.xml`):

   ```xml
   <repository>
     <id>Syncfusion-Java</id>
     <url>https://jars.syncfusion.com/repository/maven-public/</url>
   </repository>
   <dependencies>
     <dependency>
       <groupId>com.syncfusion</groupId>
       <artifactId>syncfusion-ej2-wordprocessor</artifactId>
       <version>18.4.0.30</version>
     </dependency>
     <dependency>
       <groupId>com.syncfusion</groupId>
       <artifactId>syncfusion-docio</artifactId>
       <version>18.4.0.30</version>
     </dependency>
     <dependency>
       <groupId>com.syncfusion</groupId>
       <artifactId>syncfusion-javahelper</artifactId>
       <version>18.4.0.30</version>
     </dependency>
   </dependencies>
   ```

   ([ej2.syncfusion.com][1])

2. **Implement a REST endpoint** to accept a `.docx` and return SFDT JSON:

   ```java
   @RestController
   @RequestMapping("/api/wordeditor")
   public class WordEditorController {
       @PostMapping("/Import")
       public String importDocx(@RequestParam("file") MultipartFile file) throws Exception {
           try (InputStream in = file.getInputStream()) {
               // loads and serializes to SFDT
               return WordProcessorHelper.load(in, FormatType.Docx);
           }
       }
   }
   ```

   ([ej2.syncfusion.com][1])

3. **Helper to convert to SFDT** (in `WordProcessorHelper.java`):

   ```java
   public class WordProcessorHelper {
       public static String load(InputStream stream, FormatType format) throws Exception {
           WordDocument doc = WordDocument.load(stream, format);
           String sfdt = new Gson().toJson(doc);
           doc.dispose();
           return sfdt;
       }
   }
   ```

   – Now your Angular front-end can `POST` the `.docx` and receive the SFDT JSON for the Syncfusion DocumentEditor.

[1]: https://ej2.syncfusion.com/documentation/document-editor/web-services/java "Java in EJ2 TypeScript Document editor control | Syncfusion"
