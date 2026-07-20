---
post_id: "2026-009"
title: "De-coding ENCODE: Understanding regulatory DNA through Deep learning models"

# Optional: image filename "your-image.png" in the same folder
image: "encode_logo.png"

# Optional: Enable KaTeX for inline/block math (e.g. $10^{-K}$)
math: true

# Author(s): list of names (used for /authors/<slug>/)
authors: ["Chang M. Yun", "Vivekanandan Ramalingam", "Vivian Hecht", "Anshul Kundaje"]

# Optional: full details for citation, display and JSON-LD
authors_display:
  - name: "Chang M. Yun"
    affiliation: "Stanford University"
    orcid: "0000-0003-3793-8265"
  - name: "Vivekanandan Ramalingam"
    affiliation: "Stanford University"
    orcid: "0000-0002-3631-8913"
  - name: "Vivian Hecht"
    affiliation: "Stanford University"
    orcid: "0000-0003-4110-1388"
  - name: "Anshul Kundaje"
    affiliation: "Stanford University"
    orcid: "0000-0003-3084-2287"

editor: "Genomics X AI Editors"

# Set automatically by the submission form to the GitHub login of the original
# submitter. Used by the form to surface "Update one of my previous posts" for
# the same account on later revisions. Safe to omit when authoring manually.
submitter_github: "chang-m-yun"

# Add any number of tags. They're searchable on the blog homepage. See https://genomicsxai.github.io/tags/ for examples.
tags: ["encode", "genomics", "transcription-factor", "chromatin-accessibility", "ChIP-seq", "DNase-seq", "ATAC-seq", "seq2func"]
# Category determines which homepage pill filter the post appears under.
# Supported values: "Announcement", "Blog Post", "Tutorial", "Perspective", "Paper Reviews"
#   - "Announcement"  → appears under the Announcements pill (editorial/community announcements)
#   - "Blog Post"     → appears under the Blogs pill (default for most posts)
#   - "Tutorial"      → appears under the Tutorials pill (step-by-step technical guides)
#   - "Perspective"   → appears under the Perspectives pill (opinion pieces, commentary)
#   - "Paper Reviews" → appears under the Paper Reviews pill (summaries/critiques of a published paper)
# Note: the homepage pills filter by `categories` only, not by `scope`.
categories: ["Blog Post"]

# One or more: protocols, tutorials, negative-results, discussions, insights, ideas
scope: ["resource"]
# One or more: within-field, general, intro-to-field
audience: ["general"]
labs: ["Kundaje Lab"]

status: "submitted"
revision: 1

date_submitted: 2026-07-06
date_accepted: 
date: 2026-07-06

doi: ""
zenodo_url: ""
revision_history:
  - version: 1
    date: 2026-07-06
    notes: "Initial submission"
    # Optional: version-specific DOI / Zenodo record link
    doi: ""
    zenodo_url: ""
---

{{< summary >}}
The Encyclopedia of DNA Elements (ENCODE) provides a reference map of the genomic basis of gene regulation and represents more than two decades of systematic investigation into genome function, as described in our recently submitted manuscript on the final phase of the [**ENCODE Project**](https://doi.org/10.64898/2026.07.06.731365). As part of the project, we trained BPNet models on 2,339 TF-ChIP-seq across 788 TFs; ChromBPNet models on 1,512 DNase-seq and ATAC-seq across 408 samples; ProCapNet models on six PRO-Cap across 6 samples; and ReporterNet models on three lenti-MPRA experiments, one ATAC-STARR experiment, one WG-STARR experiment, and three sets of aggregated MPRA experiments. All models, predictions, interpretation scores, discovered motifs, and genomic instances are openly available for reuse. Here, we present an example of how these models can be used to uncover the underlying rules of gene regulation. Over the next several weeks, we will share additional articles highlighting other exciting ways to use this resource.

**Contributions**:
- Primary contributors: Vivekanandan Ramalingam, Chang M. Yun, Vivian Hecht, Aman Patel, Anusri Pampari, Ziwei Chen, Johannes Linder
- Secondary contributors: Georgi K. Marinov, Kelly Cochran, Abhimanyu Banerjee, Surag Nair, Salil S. Deshpande, Zahoor Zafrulla
- Tertiary contributors: Alex M. Tseng, Amr Alexandari, Mahfuza Sharmin, Avanti Shrikumar, Jacob M. Schreiber, Caleb Lareau
- Corresponding contributors: Anshul Kundaje
- Blog post: Chang M. Yun, Vivekanandan Ramalingam, Vivian Hecht
{{< /summary >}}

> This post is the first of a series of blogs we will be releasing on the “ENCODE Deep Learning Collection”. We plan to release the following posts (subject to some change):
> 1. **Overview: What is the ENCODE Deep Learning Collection? (this post)**
> 1. Quickstart guide (5 min): How to access the ENCODE Deep Learning Collection
> 1. Understanding regulatory DNA using deep learning models
> 1. BPNet: A guide to modeling TF binding
> 1. ChromBPNet: A guide to modeling chromatin accessibility
> 1. ProCapNet: A guide to modeling transcription initiation
> 1. ReporterNet: A guide to modeling high-throughput reporter assays
> 1. Case study #1: Uncovering regulation in the MYC locus
> 1. Case study #2: Predicting the effects of non-coding variant mutations
> 1. Case study #3: MotifCompendium: A unified lexicon of regulatory sequence elements
>
> Follow us for an exciting journey on how to use deep learning models in regulatory genomics!

## Intro: DNA is not _just_ genes
The human genome contains approximately 3.2 billion base pairs of DNA. Yet, with only around 20,000 protein-coding genes, genes account for only 1-2% (~50 Mb) of the human genome. _So what does the remaining 98% do?_ 

Some of the remaining fraction contributes to the expression of genes: the process by which genes are converted into their encoded proteins and other functional products. Genes are expressed at varying rates, and sometimes not at all, that allow cells to adjust according to their needs, changing cell states (e.g., mitosis vs. G1 phase) and even cell types (e.g., red blood cell vs. hematopoietic stem cells). This change in gene expression is also encoded in large parts of the genome (significantly larger than the fraction of genome actually coding for proteins). 

However, not all of the remaining non-coding DNA actively contributes to gene expression, or any function in particular. In fact, most of the genome generally does not serve any known functional purpose. And distinguishing between functionally active and inactive parts of the non-coding genome has been a non-trivial task.
 
## ENCODE: An Encyclopedia of DNA Elements
The [**Encyclopedia of DNA Elements** (**ENCODE**)](https://www.encodeproject.org/) is a public research project that was launched to identify and understand all functionally active elements in the genome: an "Encyclopedia" of DNA elements, of sorts. In order to identify functional elements, the field has developed several experimental methods that characterize sequences that contribute to key functions.

DNA is organized into a secondary structure called chromatin, which includes structural proteins as well as transcription factors (TFs), or proteins that bind to DNA to up- or down-regulate gene expression. Similarly to thread wound around a spool, not all chromatin is accessible at all times, and binding of various TFs both influences and is determined by chromatin accessibility. Several experimental methods have been developed to characterize transcription factor binding, chromatin accessibility and transcription initiation, or how the process of gene expression begins:

**TF ChIP-seq**, or TF chromatin immunoprecipitation, is used to identify TF binding sites, one TF at a time, by using antibodies to bind a given TF that is, in turn, bound to particular regions of DNA. These bound regions are then isolated and sequenced, with reads accumulating at TF binding sites. TF-ChIP-seq datasets are typically analyzed to identify peaks from these accumulated reads.

![Figure: TF ChIP-seq](TFChIP.gif "width=300 Illustration of TF ChIP-seq: (1) TF binds to accessible DNA; (2) DNA is broken into fragments; (3) Antibodies bind to TF-DNA complex; (4) TF-DNA complex is pulled down; (5) Isolated DNA is cleaned and sequenced; (6) Sequences accumulate around the TF binding site.")

In **DNase-seq** and **ATAC-seq**, DNA-digesting enzymes (DNase I and Tn5 transposase respectively) cut accessible chromatin into small fragments. These fragments are then isolated and sequenced, and accumulate in regions of open chromatin, analogously to TF-ChIP-seq. Worth noting is that DNase I and Tn5 transposase bind to specific DNA sequences, in addition to in open chromatin, leading to a slight bias in the form of an increased number of reads to particular regions. We discuss this further in subsequent sections.

![Figure: DNase-seq, ATAC-seq](ChromatinAccessibility.gif "width=300 Illustration of DNase-seq, ATAC-seq: (1) DNA can wrap around histones ('closed') or remain unwound ('open'); (2) Enzymes (DNase I or Tn5 transposase) cut accessible DNA; (3) DNA fragments are sequenced; (4) Accessible regions appear as peaks.")

In addition to chromatin accessibility and transcription factor binding, gene expression is further regulated in the moments preceding transcription. **PRO-cap** uses a process of DNA-tagging and capture to determine the position of RNA polymerase II (Pol II), a protein which transcribes DNA to RNA transcription initiation. Accumulating Pol II indicates positions of transcriptional regulation, and these can be detected via accumulation of PRO-cap reads at particular genomic locations.
 
And **MPRAs** and related high throughput reporter assays are used to experimentally measure whether particular sequences are in fact responsible for regulating gene expression. In general, a candidate regulatory element, or ccRE, is inserted into a short sequence which also includes a measurable reporter output, such as a fluorescent molecule. The greater the level of the measured reporter, the more active the regulatory element.

ENCODE has developed a set of approximately 16,000 standardized, uniformly processed datasets for the assays described above and many others, across a wide range of cell lines, primary cells and tissues. These are organized and publicly available for download via the [ENCODE portal](https://encodeproject.org). The consortium recently released a preprint describing the newly included datasets in the fourth and final phase of the project [ENCODE 4](https://www.biorxiv.org/content/10.64898/2026.07.06.731365v1).

![Figure: ENCODE cube](ENCODE_cube.png "width=600 Coverage of the ENCODE Project: 100s of biochemical markers, performed in 100s of cell types and tissues, measured across 3 billion genomic positions. From Roadmap Epigenomics Consortium et al. Integrative analysis of 111 reference human epigenomes. Nature 518, 317–330 (2015). (https://doi.org/10.1038/nature14248)")
Coverage of the ENCODE Project: hundreds of biochemical markers, performed in hundreds of cell types and tissues, measured across 3 billion genomic positions. From _Roadmap Epigenomics Consortium et al. Integrative analysis of 111 reference human epigenomes. Nature 518, 317–330 (2015). ([https://doi.org/10.1038/nature14248](https://doi.org/10.1038/nature14248))_
 
## Deep learning models can help uncover the mechanisms of regulation
However, while the signals from the experimental assays can help directly map the locations of active regulatory genomic elements, they do not answer how and why they work. _Why are these locations special? How do they actually affect expression? What would happen if we were to mutate a base?_ To explain what we are observing, traditionally, we have performed classic, statistical enrichment-based methods to identify enriched sequences that, in turn, help identify potential mechanisms for the sequence enrichment. However, instead, we have proposed using deep learning models to help better uncover the underlying mechanisms of regulation. 

**1.** Conceptually, first, we train a model that can reconstruct the observed experimental signal when given the DNA sequence of the region. If correctly regularized, the model should only be able to perform this reconstruction by learning and mimicking the underlying rules of regulation. 

![Figure: Train a model](BPNet_Fig1.gif "width=600 Train a model to predict experimentally observed signal from DNA sequence.")

**2.** Second, we look inside the trained model using interpretation methods, and extract what it has learned—thereby identifying the underlying mechanisms of regulation. For example, one method is to identify and quantify the bases that the model used to make its prediction (e.g., DeepLIFT/DeepSHAP). The most important bases can directly be attributed to the sequence preference of known transcription factors.   

![Figure: Interpret the model](BPNet_Fig4.gif "width=600 Identify highly contributing bases used by the model during prediction.")

**3.** Additionally, with the trained model, we can now perform other useful augmentations to the data. One example is to predict the effect of unseen mutations in the genome. This can be particularly useful, for example, for identifying causal mutations (e.g., fine-mapping GWAS candidates). 

![Figure: Predict mutations](BPNet_Fig3.gif "width=600 Predict the effect of unseen mutations in the genome.")

**4.** Another example of augmentation is to remove undesirable experimental artifacts from the data. Experimental assays often suffer from unwanted artifacts, such as activity of antibodies and enzymes (e.g., DNase I, Tn5 transposase), that confound the true underlying signal. We can train a separate model to predict only the effects of the experimental artifact (e.g., from a control experiment), and subtract its effect to isolate _only_ the regulatory signal.

![Figure: Remove bias](BPNet_Fig2.gif "width=600 Remove the effects of unwanted experimental artifacts, by training a separate model to predict the experimental effects then subtracting it from the total signal.")

## The "BPNet family" of models
Our group has developed deep learning models, which can learn and predict the effects of DNA sequence on different types of regulation of gene expression. They include:
- **BPNet:** A convolutional neural network (CNN) trained on TF-ChIP-seq that predicts the binding of a TF from DNA sequence;
- **ChromBPNet:** A CNN with a BPNet-like architecture trained on DNase- or ATAC-seq that predicts chromatin accessibility from DNA sequence and corrects for enzymatic bias;
- **ProCapNet:** A CNN with a BPNet-like architecture trained on ProCAP-seq that predicts transcription initiation from DNA sequence;
- **ReporterNet:** A CNN with a BPNet-like architecture trained on MPRA data that predicts large-scale reporter assay signal from DNA sequence.

In the following section, we share an example in the MYC locus to showcase the power of the models:

![Figure: ChromBPNet model architecture](ChromBPNet.png "width=600 Example BPNet-style model architecture with bias-correction: ChromBPNet. From Pampari, A. et al. ChromBPNet: bias factorized, base-resolution deep learning models of chromatin accessibility reveal cis-regulatory sequence syntax, transcription factor footprints and regulatory variants. 2024.12.25.630221 Preprint at https://doi.org/10.1101/2024.12.25.630221 (2024).")
Example BPNet-style model architecture with bias-correction: ChromBPNet. From _Pampari, A. et al. ChromBPNet: bias factorized, base-resolution deep learning models of chromatin accessibility reveal cis-regulatory sequence syntax, transcription factor footprints and regulatory variants. _bioRxiv_ 2024.12.25.630221 (2024). ([https://doi.org/10.1101/2024.12.25.630221](https://doi.org/10.1101/2024.12.25.630221))_

## Case study: Regulation in the MYC locus through the lens of deep learning models
The Myc family of proteins is a set of transcription factors that play an important role in cell proliferation, and mutations in the MYC gene have been shown to lead to many different types of cancer. Thus, understanding the mechanisms of regulation at the MYC locus with base-pair resolution can allow us to answer important questions relating to disease biology, Below, we view a CRISPRi-validated distal enhancer in the MYC locus [chr8:127,898,412—127,899,647] through the lens of 15 different models.

First, examining chromatin accessibility through ChromBPNet models: the models recapitulate the observed experimental profile with high concordance. Further, the models can de-noise the profile to isolate the true underlying accessibility signal, reconciling DNase and ATAC-seq experimental methods into agreement (where raw signals can diverge due to enzyme differences).
 
![Figure 2](MYC_fig2.png "width=600 Observed, model-predicted, and model-corrected DNase-seq and ATAC-seq profiles by ChromBPNet.")
 
Second, using the models, we highlight the key sequence drivers that the models identified to make their predictions (as "contribution scores"), and begin to see the underlying biological mechanism of regulation at this locus:

Examining the highly contributing sequences for chromatin accessibility through ChromBPNet, we observe key transcription factors (e.g., GATA, AP1, SP, ETV) that drive accessibility—in agreement with prior understanding.

In parallel, examining the key sequences for TF binding through BPNet, we observe the same sequences predict TF binding, in agreement with ChromBPNet—despite being trained on two entirely orthogonal assay types (TF ChIP-seq vs. DNase-seq/ATAC-seq).

![Figure 3](MYC_fig3.png "width=600 Highly contributing sequences used by the models during prediction. Insets compare contribution maps across DNase/ATAC (ChromBPNet), MPRA (ReporterNet), and TF ChIP-seq models (BPNet; e.g., GATA2, SP1, CEBPB, JUND, GABPB1), with high-impact motif instances annotated (e.g., GATA, SP, AP-1, ETV/ETS, CEBP).")
 
Finally, we can repeat the analysis for HepG2 (also showing high concordance and known sequence motifs), and compare the highly contributing sequences between K562 vs. HepG2: we see some agreement (e.g., AP1, SP, ETV), but also some that disappear (e.g., GATA), while others that newly appear (e.g., FOX) in HepG2—showcasing the cell type variation of this enhancer.
 
![Figure 4](MYC_fig4.png "width=600 Comparing highly contributing sequences used by the model trained on K562 vs. HepG2.")
 
Below, we provide an interactive browser session of the exact locus to view dynamically:

{{< igv-browser panel="myc" data="myc-igv-panel.json" >}} 

## Decoding ENCODE: An 'Encyclopedia' of regulatory DNA deep learning models
In the ENCODE Deep learning collection (De-ENCODE), we trained these models on hundreds of cell and tissue types available through the ENCODE consortium. We trained [BPNet](https://doi.org/10.1038/s41588-021-00782-6) models on 2,339 TF-ChIP-seq across 788 TFs, [ChromBPNet](https://doi.org/10.1101/2024.12.25.630221) models on 1,512 DNase-seq and ATAC-seq across 408 biosamples, [ProCapNet](https://doi.org/10.1101/2024.05.28.596138) models on 6 PRO-Cap, and ReporterNet models on 8 MPRAs to capture the dynamic regulatory activity across diverse samples. We release them together with the fourth and final phase of the ENCODE Project.
 
Through the power of the models and the richness of the ENCODE dataset, we hope to empower the community at large to explore important questions relating to the fundamental biology of gene regulation and mechanisms of disease in a wide variety of tissues and cell types. 

## How can I use the resource?
As part of the ENCODE Project, all data, models, analysis are available at the [Project portal](https://www.encodeproject.org/). If you use our models, please cite the [ENCODE preprint](https://doi.org/10.64898/2026.07.06.731365). 

Beyond the ENCODE portal, we provide several user-friendly alternatives for accessing and visualizing our data: 
- **Models**: We have uploaded the models for open access on [**Hugging Face**](https://huggingface.co/collections/kundajelab/encode-bpnet-models)
- **Predictions, contributions, and instances**: We have created a [**UCSC Track Hub**](https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&hubUrl=https://kundajelab.github.io/ucsc-trackhub-encode.github.io/hub.txt) for easy, interactive browser sessions
- **User guide**: We are currently building an _interactive_ user guide to help the community navigate and explain the resource (_work in progress_)
- **Preprint**: For more detail, the latest ENCODE preprint is out on [_bioRxiv_](https://doi.org/10.64898/2026.07.06.731365)
 
We still have so much to share about the resource! We are planning to regularly share the many different ways you can use the resource (~every week) for the foreseeable future, so give us a follow and be on the lookout for more.

## References
1. The ENCODE Project Consortium et al. The Encyclopedia of DNA Elements. _bioRxiv_ 2026.07.06.731365 (2026) ([https://doi.org/10.64898/2026.07.06.731365](https://doi.org/10.64898/2026.07.06.731365))
2. Avsec, Ž. et al. Base-resolution models of transcription-factor binding reveal soft motif syntax. _Nat Genet_ 53, 354—366 (2021). ([https://doi.org/10.1038/s41588-021-00782-6](https://doi.org/10.1038/s41588-021-00782-6))
3. Pampari, A. et al. ChromBPNet: bias factorized, base-resolution deep learning models of chromatin accessibility reveal cis-regulatory sequence syntax, transcription factor footprints and regulatory variants. _bioRxiv_ 2024.12.25.630221 (2024). ([https://doi.org/10.1101/2024.12.25.630221](https://doi.org/10.1101/2024.12.25.630221))
4. Cochran, K. et al. Dissecting the cis-regulatory syntax of transcription initiation with deep learning. _bioRxiv_ 2024.05.28.596138 (2024). ([https://doi.org/10.1101/2024.05.28.596138](https://doi.org/10.1101/2024.05.28.596138))
5. Yun, C. M. et al. A unified lexicon of predictive DNA sequence motifs from ENCODE transcription factor binding and chromatin accessibility assays. (2025) doi:10.5281/zenodo.17179111. ([https://doi.org/10.5281/zenodo.17179111](https://doi.org/10.5281/zenodo.17179111))
