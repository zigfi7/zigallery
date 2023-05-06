# zigallery
Simple image gallery for browsing large personal photo collections.

The idea for this gallery arose from the fact that I always had trouble processing large amounts of files that I usually have on my computer, from various sources such as the internet, file recovery, or generating images, for example with stable diffusion models. Therefore, I tried using different types of galleries, but it usually ended poorly due to memory overflow and program crashes or inefficient cooperation with the browser when dealing with a large number of files.

As for web galleries run by a website, the situation is not better. These systems often create unnecessary files such as temp files and have additional rigid databases that are not suitable for quick changes. While they work well for a larger scale and a larger number of users, I have not found any such gallery that is simple and fast enough for my purposes.

Therefore, I created a Node.js script that has these features. It can handle a large number of files and create easy-to-browse tabs for them. However, it relies on request to search the disk and create thumbnails on the fly, as well as to generate a list of files. This means that reloading the page will generate the entire list again.

There are pros and cons to this approach. On the one hand, it provides an updated list if the files are generated on the fly. On the other hand, each request processes all files from the beginning, so this gallery is not suitable for publicly sharing files with a large number of people.

I have explored different options such as dynamic file rotation and reading various data, but each operation takes some computational time. Therefore, I have noticed that the more additional features I add, such as image rotation or checking resolution, the longer the processing time. Perhaps we could consider updating the gallery in the future.

If anyone would like to provide feedback or collaborate on this gallery, I am open to suggestions.



To use the gallery.js node script, follow these simple installation steps:

1)  Clone the repository to your local machine.
2)  Navigate to the folder where the script is located.
3)  Run npm install to install the required dependencies.
4)  Create a config file based on the provided example (copy it and edit it) to specify the root image folder location. You may also want to change the serving port.
5)  Run node images.js to start the script.