---
post_id: "2026-009"
title: "ENCODE 4: The Encyclopedia of DNA Elements"

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
The 4th and final phase of the [**ENCODE Project**](https://doi.org/10.64898/2026.07.06.731365) is released today for **free and unrestricted public use**. We trained [BPNet](https://doi.org/10.1038/s41588-021-00782-6) models on 2,339 TF-ChIP-seq across 788 TFs, [ChromBPNet](https://doi.org/10.1101/2024.12.25.630221) models on 1,512 DNase-seq and ATAC-seq across 408 samples, [ProCapNet](https://doi.org/10.1101/2024.05.28.596138) models on 6 PRO-Cap, and ReporterNet models on 8 MPRAs as part of the Project. We showcase an example of how to use the models to understand the underlying rules of regulation. We share all models, predictions, interpretation scores, discovered motifs, and genomic instances for open use. We plan to share new stories about how to use the resource over the next several weeks.

**Contributions**:
- Primary contributors: Vivekanandan Ramalingam, Chang M. Yun, Vivian Hecht, Aman Patel, Anusri Pampari, Ziwei Chen, Johannes Linder, Soumya Kundu, Ivy Evergreen, Austin Wang, Daniel Kim, Eran Kotler
- Secondary contributors: Georgi K. Marinov, Kelly Cochran, Abhimanyu Banerjee, Surag Nair, Salil S. Deshpande, Zahoor Zafrulla, Riya Sinha
- Tertiary contributors: Alex M. Tseng, Amr Alexandari, Mahfuza Sharmin, Avanti Shrikumar, Jacob M. Schreiber, Caleb Lareau
- Corresponding contributors: Anshul Kundaje
- Blog post: Chang M. Yun, Vivekanandan Ramalingam, Vivian Hecht
{{< /summary >}}

---
## ENCODE: Encyclopedia of DNA Elements
The human genome contains approximately 3.2 billion base pairs of DNA. Yet, with only around 20,000 protein-coding genes, this accounts for only 1.5% (~50 Mb) of the human genome. The remaining, non-coding portion contains a vast array of functional and regulatory elements that control gene expression. The [**Encyclopedia of DNA Elements** (**ENCODE**)](https://www.encodeproject.org/) is a public research project dedicated to building a comprehensive "Encyclopedia" of all of these elements. [ENCODE 4](https://www.biorxiv.org/content/10.64898/2026.07.06.731365v1) is the fourth and final phase of the project, expanding the catalog across diverse biological samples and new functional assays, including ChIP-seq across 1,100 proteins, DNase-seq across 3,425 samples, ATAC-seq across 464 samples—totaling _over 16,000 genome-wide experiments_.

![Figure: ENCODE cube](ENCODE_cube.png "width=600 The ENCODE Project has collected and identified functional genomic elements (1) using 100s of functional biochemical markers, (2) in 100s of different cell type contexts, (3) across the 3 billion genomic positions.")
_Roadmap Epigenomics Consortium et al. Integrative analysis of 111 reference human epigenomes. Nature 518, 317–330 (2015). ([https://doi.org/10.1038/nature14248](https://doi.org/10.1038/nature14248))_

## An 'Encyclopedia' of regulatory DNA deep learning models
In previous work, we have shown how deep learning models can be used to understand how sets of transcription factor binding motifs can be composed together in a form of regulatory syntax, similarly to how we construct a sentence out of words corresponding to different parts of speech. Moreover, we can use our models to make predictions about how individual non-coding variants can disrupt transcription factor binding, furthering our understanding of mechanisms of disease. The richness of the ENCODE dataset enables us to explore these topics and more in a wide variety of tissues and cell types. By providing our models and analyses to the community at large, we hope to empower others to do so as well.

Using the latest ENCODE data, we trained [BPNet](https://doi.org/10.1038/s41588-021-00782-6) models on 2,339 TF-ChIP-seq across 788 TFs, [ChromBPNet](https://doi.org/10.1101/2024.12.25.630221) models on 1,512 DNase-seq and ATAC-seq across 408 biosamples, [ProCapNet](https://doi.org/10.1101/2024.05.28.596138) models on 6 PRO-Cap, and ReporterNet models on 8 MPRAs to capture the dynamic regulatory activity across diverse samples.

In the following section, we share one example of how to use the resource.

## Understanding regulation through the lens of deep learning models
Below, we view an example genomic region—a _CRISPRi-validated_ distal enhancer in the MYC locus [chr8:127,898,412—127,899,647]—through the lens of **15 different models**.

![Figure 1](MYC_fig1.png "width=600 Deep learning model-derived browser tracks at a CRISPRi-validated distal enhancer at the MYC locus in K562 (chr8:127,898,412—127,899,647; ~162 kb downstream of the MYC promoter). From top to bottom: observed DNase-seq and ATAC-seq profiles, model predicted DNase-seq and ATAC-seq profiles at base-resolution (ChromBPNet), bias-corrected predictions at base-resolution, and sequence contribution maps. Insets compare contribution maps across DNase/ATAC (ChromBPNet), MPRA (ReporterNet), and TF ChIP-seq models (BPNet; e.g., GATA2, SP1, CEBPB, JUND, GABPB1), with high-impact motif instances annotated (e.g., GATA, SP, AP-1, ETV/ETS, CEBP). The same is repeated in HepG2.")

First, examining chromatin accessibility through ChromBPNet models: the models recapitulate the observed experimental profile with high concordance. Further, the models can de-noise the profile to isolate the true underlying accessibility signal, reconciling DNase and ATAC-seq experimental methods into agreement (where raw signals can diverge due to enzyme differences).

![Figure 2](MYC_fig2.png "width=600 Observed, model-predicted, and model-corrected DNase-seq and ATAC-seq profiles by ChromBPNet.")

Second, using the models, we highlight the key sequence drivers that the models identified to make its predictions (as "contribution scores"), and begin to see the underlying biological mechanism of regulation at this locus:

Examining the highly contributing sequences for chromatin accessibility through ChromBPNet, we observe key transcription factors (e.g., GATA, AP1, SP, ETV) that drive accessibility—in agreement with prior understanding.

In parallel, examining the key sequences for TF binding through BPNet, we observe the same sequences predict TF binding, in agreement with ChromBPNet—despite being trained on two entirely orthogonal assay types (TF ChIP-seq vs. DNase-seq/ATAC-seq).

![Figure 3](MYC_fig3.png "width=600 Highly contributing sequences used by the models during prediction. Insets compare contribution maps across DNase/ATAC (ChromBPNet), MPRA (ReporterNet), and TF ChIP-seq models (BPNet; e.g., GATA2, SP1, CEBPB, JUND, GABPB1), with high-impact motif instances annotated (e.g., GATA, SP, AP-1, ETV/ETS, CEBP).")

Finally, we can repeat the analysis for HepG2 (also showing high concordance and known sequence motifs), and compare the highly contributing sequences between K562 vs. HepG2: we see some agreement (e.g., AP1, SP, ETV), but also some that disappear (e.g., GATA), while others that newly appear (e.g., FOX) in HepG2—showcasing the cell type variation of this enhancer.

![Figure 4](MYC_fig4.png "width=600 Comparing highly contributing sequences used by the model trained on K562 vs. HepG2.")

Below, we provide an interactive browser session of the exact locus to view dynamically:

{{< igv-browser panel="myc" data="myc-igv-panel.json" >}}

## How can I use the resource?
As part of the ENCODE Project, all data, models, analysis are shared **without restriction** at the [Project portal](https://www.encodeproject.org/).

Additionally, we have tried our best to make the resource as user-friendly as possible: 
- **Models**: We have uploaded the models for open access on [**Hugging Face**](https://huggingface.co/collections/kundajelab/encode-bpnet-models) 
- **Predictions, contributions, and instances**: We have created a [**UCSC Track Hub**](https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&hubUrl=https://kundajelab.github.io/ucsc-trackhub-encode.github.io/hub.txt) for easy, interactive browser sessions
- **User guide**: We are currently building an _interactive_ user guide to help the community navigate and explain the resource (_work in progress_)
- **Preprint**: For more detail, the latest ENCODE preprint is out on [_bioRxiv_](https://doi.org/10.64898/2026.07.06.731365)

Lastly, we still have so much to share about the resource! We are planning to regularly share the many different ways you can use the resource (~every week) for the foreseeable future, so give us a follow and be on the lookout for more.

## References
1. The ENCODE Project Consortium et al. The Encyclopedia of DNA Elements. _bioRxiv_ 2026.07.06.731365 (2026) ([https://doi.org/10.64898/2026.07.06.731365](https://doi.org/10.64898/2026.07.06.731365))
2. Avsec, Ž. et al. Base-resolution models of transcription-factor binding reveal soft motif syntax. _Nat Genet_ 53, 354—366 (2021). ([https://doi.org/10.1038/s41588-021-00782-6](https://doi.org/10.1038/s41588-021-00782-6))
3. Pampari, A. et al. ChromBPNet: bias factorized, base-resolution deep learning models of chromatin accessibility reveal cis-regulatory sequence syntax, transcription factor footprints and regulatory variants. _bioRxiv_ 2024.12.25.630221 (2024). ([https://doi.org/10.1101/2024.12.25.630221](https://doi.org/10.1101/2024.12.25.630221))
4. Cochran, K. et al. Dissecting the cis-regulatory syntax of transcription initiation with deep learning. _bioRxiv_ 2024.05.28.596138 (2024). ([https://doi.org/10.1101/2024.05.28.596138](https://doi.org/10.1101/2024.05.28.596138))
5. Deshpande, S. et al. A unified lexicon of predictive DNA sequence motifs from ENCODE transcription factor binding and chromatin accessibility assays. (2025) doi:10.5281/zenodo.17179111. ([https://doi.org/10.5281/zenodo.17179111](https://doi.org/10.5281/zenodo.17179111))
