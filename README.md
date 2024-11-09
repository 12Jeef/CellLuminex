<a href="https://cell-luminex.vercel.app/"><img src="./banner.svg" width="100%"></a>

<div align="center">
    <p>Fluorescent Cell Calculator and Counter</p>
</div>

## Purpose

Here's what this app does: count cell bodies for you! Built
specifically around the SSSIP program at Stanford,
it is able to identify with 90% accuracy cell bodies stained fluorescently

This outshines any traditional method of purely manual counting,
such as with [ImageJ](https://imagej.net/ij/), automating the process\*

\*It's not fully automated, but performs well

## How does this work?

1.  The script first performs a simple filter over your image, boosting contrast and hiding or showing the RGB channels
2.  Next, the script performs a brightness boosting algorithm by looking within a neighborhood double the size of a typical cell that you specify
3.  Third, the script performs a thresholding pass to prepare the image for the final step
4.  Finally, the script does a flood-fill pass over the entire image, scrubbing out all the cell bodies

## Why was this made?

Well, when I participated in SSSIP in 2023, we were provided the
same task: count transfection efficiency of a immunofluorescently-dyed image.
All other three lab groups manually counted. I was lab lead, and being lazy,
wrote a python program that performed just steps 3 and 4 of the process above.
It was accurate enough for the time, but I wanted to develop the algorithm further.
And here we are!

## Anything else?

Interested in what I've done? Check out [my website](https://12jeef.github.io/) for more cool projects I've done!
