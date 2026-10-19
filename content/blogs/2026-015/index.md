---
post_id: "2026-013"
title: "ChromBPNet-refactor: An optimized, reproducible implementation in PyTorch/TensorFlow/JAX with bug fixes"

# Optional: image filename "your-image.png" in the same folder
image: "chrombpnet_refactor.png"

# Optional: Enable KaTeX for inline/block math (e.g. $10^{-K}$)
math: true

# Author(s): list of names (used for /authors/<slug>/)
authors: ["Chang M. Yun", "Vivian Hecht", "Anshul Kundaje"]

# Optional: full details for citation, display and JSON-LD
authors_display:
  - name: "Chang M. Yun"
    affiliation: "Stanford University"
    orcid: "0000-0003-3793-8265"
    contact: "chang.m.yun@stanford.edu"
  - name: "Vivian Hecht"
    affiliation: "Stanford University"
    orcid: "0000-0003-4110-1388"
    contact: "vhecht@stanford.edu"
  - name: "Anshul Kundaje"
    affiliation: "Stanford University"
    orcid: "0000-0003-3084-2287"
    contact: "akundaje@stanford.edu"

editor: ["Genomics X AI Editors",]

# Set automatically by the submission form to the GitHub login of the original
# submitter. Used by the form to surface "Update one of my previous posts" for
# the same account on later revisions. Safe to omit when authoring manually.
submitter_github: "chang-m-yun"

# Add any number of tags. They're searchable on the blog homepage. See https://genomicsxai.github.io/tags/ for examples.
tags: ["encode", "genomics", "deep-learning", "seq2func", "chromatin-accessibility", "DNase-seq", "ATAC-seq"]
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

status: "accepted"
revision: 1

date_submitted: 2026-10-20
date_accepted: 
date: 2026-10-20

doi: ""
zenodo_url: ""
revision_history: ""
---

{{< summary >}}
__ChromBPNet__ is a deep learning DNA sequence model that models chromatin accessibility, at base-resolution with DNase I/Tn5 transposase enzyme bias-factorization. Despite wide use of the model, there have been several improvements that we had been considering. Here, we apply those updates and present a [__refactored codebase of ChromBPNet__](https://github.com/kundajelab/chrombpnet-refactor/), that systemically improves the following: (1) support all 3 major deep learning frameworks, on the latest GPU hardware: PyTorch, TensorFlow, JAX; (2) allow flexible cut-site convention for DNase-seq; (3) implemented the optimizations performed by Anthropic’s latest Claude Fable/Mythos 5.1 in their recent [model release](https://www.anthropic.com/claude-fable-and-mythos-5-1), and (4) some additional optimizations during pre- and post-processing–all with confirmed reproducibility to the original model. We share this study to highlight the benefits of early open access code to the community to help build better software and understanding together. 
{{< /summary >}}

---
## ChromBPNet: A bias factorized, base-resolution deep learning model of chromatin accessibility

ChromBPNet is a deep learning model of __chromatin accessibility__: the degree of accessibleness of a region of chromatin–the native DNA molecule in eukaryotic cells, that is in complex with other nuclear proteins and RNA to be packaged into a dense, compact structure–that in turn, determines how much the DNA is accessible to other cellular processes, including transcription. Experiments measure the level of accessibility of different regions of the genome in different cell types: “DNase-seq” uses the enzyme DNase I to cut exposed DNA; “ATAC-seq” uses the Tn5 transposase enzyme to insert sequencing adapters into accessible DNA. Depending on how accessible the region is, the enzymes DNase I/Tn5 transposase have more/less access to the DNA to perform their activities. By sequencing and mapping the resulting DNA fragments and their suggested enzyme activity sites, chromatin regions that contain many mapped fragments are quantified as highly accessible (as “peaks”) while regions with low fragments are quantified as inaccessible (as “non-peaks”).

However, the enzymes DNase I and Tn5 transposase also have preferences for particular DNA sequences, so the observed signal profiles reflect both genuine chromatin accessibility and assay-specific sequence bias. Separating these components is especially important when interpreting the signal at single-base resolution.

Here, ChromBPNet was developed to learn to predict chromatin accessibility signal from DNA sequence, at base-resolution with the explicit factorization of the enzyme’s sequence bias. ChromBPNet, together with robust model interpretation methods, has previously been shown to predict accessibility in unseen chromosomes, identify the binding preference and binding sites of known, cell type-specific transcription factors (TFs) that influence accessibility, and predict the effects of genomic variation on accessibility (caQTLs) across cell type and population–which we expanded to train 1,512 ChromBPNet models as part of [ENCODE GRAMMAR](https://genomicsxai.github.io/blogs/2026-012/). 

However, while highly effective, like any model, ChromBPNet had room for improvements.

## 1. Support all 3 major deep learning libraries, on modern hardware: PyTorch, TensorFlow, JAX

__Problem__: Deep learning advances rapidly. While development of the original ChromBPNet began in 2021, and hence developed on the latest deep learning packages and hardware at the time–TensorFlow 2.8 on Python 3.8–the deep learning stack has rapidly accelerated since, making ChromBPNet frequently incompatible on the modern versions.

__Solution__: Here, we reimplemented ChromBPNet across all 3 major deep learning libraries: PyTorch (default), TensorFlow 2.21 (with Keras 3), and JAX (with Keras 3), all behind one shared, framework-neutral pipeline.

How to use: Each engine has its own conda environment, because their frameworks cannot
share one. Create the ones you need from the repository root:

| Engine | Create the environment | Then | Python and framework |
|---|---|---|---|
| PyTorch (default) | `conda env create -f envs/chrombpnet-pytorch.yml` | `conda activate chrombpnet-pytorch` | Python 3.11, PyTorch 2.5.1 |
| TensorFlow | `conda env create -f envs/chrombpnet-tensorflow.yml` | `conda activate chrombpnet-tensorflow` | Python 3.8, TensorFlow 2.8.0 |
| JAX | `conda env create -f envs/chrombpnet-jax.yml` | `conda activate chrombpnet-jax` | Python 3.12, Keras 3.15, JAX 0.11.2 |

Pick the engine with --engine (the checkpoint suffix decides when it is omitted) and the device with --device cpu, cuda or e.g. cuda:1. envs/README.md describes each engine, its GPU libraries, and what differs between them.

## 2. Adaptable cut-site convention for DNase-seq

>Note: We are grateful to our colleagues at [Relation Therapeutics](https://www.relationrx.com/) for identifying this issue to us.

__Problem__: When constructing the experimental “ground truth" signal from the raw sequencing data, we map and count up the exact location that the enzyme was applied on the genome. For ATAC-seq, this is straightforward: Tn5 transposase acts as a homodimer to introduce a “tagmentation”–a single-stranded DNA break, followed by an immediate 5’-to-3’ ligation that attaches adapter sequences to the break (for later sequencing)–at two nearby sites that are 9 bp apart, one on each strand. Hence, to identify the exact position that the Tn5 transposase was applied, by convention, we take the middle of the two cut sites that are 9 bp apart as its position–which conveniently, coincides on top of a base (since the 9 bp gap is odd). When both ends of a region of chromatin is “tagmented”, the region is no longer attached to the original long chromatin and free as a DNA fragment, which can then be sequenced by next generation sequencing (NGS). Hence, to identify the position of the Tn5 transposase from only one DNA fragment, we trace back the other cut site that must have occurred 9 bp away, and identify its middle position, which is equivalent to positions +4 bp or -4 bp (depending on the strand direction) from the 5’ end of the sequenced fragment (note: the 3’ end of the sequence fragment is not used to maintain constant sequencing read length: 1 bp). This results in one distinct base pair position per enzyme effect site.

![Figure: Processing ATAC-seq sequencing counts.](atac.png “width=600 Schematic of ATAC-seq using Tn5 transposase to measure chromatin accessibility, and its cut site convention at +4 bp / -4 bp.”)

However, for DNase-seq, identifying the exact position of the enzyme activity is trickier: DNase I cleaves at just one site and the “middle” position is not on top of a specific base pair position, but _between_ two base pairs, i.e., on a specific _bond position_. For DNase-seq, DNase I only introduces one cut: a single double-stranded break between two base pairs. Hence, the “position” of the DNase I would ideally also be at the middle of the two base pairs, or on the cleaved bond itself. However, since we in genomics use one-hot-style sequence encoding, we must place the DNase I on some base pair position. By convention, we can either place the DNase I on the right-hand side of the break (which would imply the positions 0 bp or +1 bp from the sequenced 5’ end, depending on the strand), or on the left-hand side of the break (which would imply positions -1 bp or 0 bp from the sequenced 5’ end, depending on the strand), or on both sides of the break (which would imply positions 0 and -1, or 0 and +1, depending on the strand). In the original ChromBPNet, we had selected the right-hand side convention: 0 bp on the positive strand, -1 bp on the negative strand. This ensured that irrespective of which direction of the break was sequenced, we stacked counts on the same base pair position. 

However, the issue arises during reverse complement augmentation of the data. In DNA sequence models, we are often (un)fortunate to double our data for free/need to take into account the opposite strand’s sequence, by taking the reverse complement of the original data. ChromBPNet also followed this training protocol: take the reverse complement of the sequencing reads to double the training data. However, when taking the reverse complement of the sequence, we cannot simply also take the reverse complement of the signal: the reverse complement not only inverts the sequence, but also inverts the enzyme position convention. For a single symmetric convention, such as ATAC-seq, the inversion is still identical. However, for a non-symmetric convention, such as DNase-seq, the inversion led to two different conventions between the original data and the reverse complement-augmented data: right-hand convention for the original data, and left-hand convention for the reverse complement-augmented data.

![Figure: Processing DNase-seq sequencing counts.](dnase.png “width=600 Schematic of DNase-seq using DNase I to measure chromatin accessibility, and its right-hand side cut site convention at 0 bp / +1 bp.”)

This explained several phenomena we had observed. First, during evaluation of ChromBPNet, comparing model performance on ATAC-seq vs. DNase-seq, while the counts head prediction (= predicted total counts inside the 1 kb region) performance was comparable between the two assays (ATAC-seq: ~0.7 vs. DNase-seq: ~0.7; Pearson correlation; higher = better), the profile head prediction (= predicted distribution of the total counts, as a probability distribution; where counts x prediction = predicted signal) performance was significantly worse in DNase-seq (ATAC-seq: ~0.5 vs. DNase-seq: ~0.8; Jensen-Shannon distance (JSD); lower = better). 

![Figure: Original ChromBPNet performance: ATAC-seq vs. DNase-seq.](chrombpnet_performance.png “width=600 Performance of the original ChromBPNet model trained on ATAC-seq vs. DNase-seq from ENCODE cell lines. Left: Counts head performance, evaluated by Pearson correlation (higher = better). Right: Profile head performance, evaluated by Jensen-Shannon distance (lower = better). While counts head performance is comparable (left), profile head performance in DNase-seq is consistently worse than in ATAC-seq (right).”)

Second, this was also observed in benchmarks against other models: in comparison with AlphaGenome, while ChromBPNet profile prediction performance was marginally comparable with AlphaGenome in ATAC-seq (AlphaGenome: X.X vs. ChromBPNet: X.X; 1 - JSD), ChromBPNet profile prediction performance in DNase-seq was significantly worse (AlphaGenome: X.X vs. ChromBPNet: X.X; 1 - JSD). 

![Figure: AlphaGenome vs. ChromBPNet.](AG_performance.png “width=600 Performance comparison between AlphaGenome vs. ChromBPNet on profile head predictions at 1 bp resolution, evaluated by Jensen-Shannon distance (JSD). Top: Comparison on DNase-seq tracks. Bottom: Comparison on ATAC-seq tracks. Value: Relative % improvement in performance. AlphaGenome saw large improvements (+6.4%) on DNase-seq track prediction over ChromBPNet, but saw only marginal improvements (+1.6%) on ATAC-seq track predictions.”)

Third, we could artificially reproduce this performance gap: for the same original ChromBPNet model trained on K562 DNase-seq (using the unintentional convention-inversion during reverse complement-augmentation), we compared the model’s performance against the 6 different training data sources: (1) forward-only: the original ChromBPNet’s right-hand side (0/+1) convention training data, but _without_ the reverse complement-augmented data (i.e., half the training data), (2) reverse complement-only: the original ChromBPNet’s “right-hand side (0/+1) ” convention training using the reverse complement-augmented data _only_ (i.e., the other half the training data; hence, in reality left-hand side (-1/0) convention), (3) full right-hand side (0/+1) convention, (4) left-hand side (-1/0) convention, (5) both-side (0 and -1/0 and +1) convention by assigning half count to both sides, and (6) both-side (0 and -1/0 and +1) convention by assigning full integer count to both sides (i.e., double the total counts). We observed that using half the data (original, or augmented) improved profile performance (in K562 DNase-seq: original: 0.45 vs. forward-only/reverse complement-only: 0.50), while degrading counts head performance (original: 0.71 vs. forward-only/reverse complement-only: 0.68), since only half the data was used (the same drop was also observed in ATAC-seq: original 0.70 vs. forward-only/reverse complement-only: 0.68). The counts performance was fully recovered when the correct convention was applied across the full, double-augmented data using either right-hand or left-hand side convention (original: 0.71 vs. right-hand/left-hand: 0.71), while the improved profile head performance was maintained (forward-only/reverse complement-only: 0.50 vs. right-hand/left-hand: 0.50). Both both-side (0 and -1/0 and +1) conventions (half, full) showed recovered counts head performance (original: 0.71 vs. both-full/half: 0.71) and the highest profile head performance (forward-only/reverse complement-only/right-hand/left-hand: 0.50 vs. both-full/half: 0.56), due to smoothed profiles.

![Figure: ChromBPNet DNase-seq cut site convention.](chrombpnet_dnase.png “width 600 Performance evaluation of ChromBPNet trained on different training data. `original`: The original ChromBPnet model. `original-refactor`: The original ChromBPNet preprocessing, implemented in `chrombpnet-refactor`. `fr-only`: Forward-only, using the original ChromBPNet preprocessing without reverse complement-augmented data. `rc-only`: Reverse complement only, using the original ChromBPNet’s reverse complement augmentation data only.`right`: Corrected right-hand side (0/+1) convention. `left`: Corrected left-hand side (-1/0) convention. `both-half`: Both-side (0 and -1/0 and +1) convention, assigning half count to both sides. `both-full`: Both-side (0 and -1/0 and +1) convention, assigning full integer count to both sides. Red: Counts head performance, evaluated by Pearson correlation (higher = better). Blue: Profile head performance, evaluated by 1 - JSD (higher = better). Repeated in ATAC-seq and DNase-seq in the same cell line (K562) and primary cell type (stomach).”)

Further, we also investigated the cross-evaluation between the newly trained models and their corresponding test set with the original model and its test set, by evaluating the newly trained models on the original model’s test set and vice versa. We observed that the right-hand side convention model performed the best on the original ChromBPNet model’s test set on both matched counts head prediction (original: 0.71 vs. right-hand: 0.71) and improved profile head prediction (original: 0.44 vs. right-hand: 0.49), followed by forward-only model with similarly improved profile head prediction but degraded counts head prediction (as trained on half the data). Both both-side conventions showed the same performance as the original model (original: 0.44 vs. both-half/full: 0.44), suggesting that the training scheme was effectively equivalent. And left-side convention and reverse complement-only performed the worst, with profile head prediction degrading dramatically as predictions were constantly off by one (due to convention differences), with only half the training data used by the reverse complement-only model. Lastly, evaluating the original ChromBPNet model on the newly processed test sets, the original model performed the best on the both both-side convention test sets, as well as the actual both-side models trained on its own data convention (original: 0.56 vs. both-half/full: 0.56), further confirming that the training schemes were effectively equivalent, and the original model was effectively predicting a both-side convention signal. The original model showed equally degraded profile head performance on right-hand and left-hand side conventions, suggesting a symmetric prediction off by half the counts.

![Figure: ChromBPNet DNase-seq cut site convention.](chrombpnet_dnase.png “width 600 Cross-evaluation across newly trained models and the original ChromBPNet model: Newly trained models’ performance on the original ChromBPNet model’s test set (original and original-refactor). The original ChromBPNet model’s performance (original and original-refactor) on each newly trained model’s test set. `original`: The original ChromBPnet model. `original-refactor`: The original ChromBPNet preprocessing, implemented in `chrombpnet-refactor`. `fr-only`: Forward-only, using the original ChromBPNet preprocessing without reverse complement-augmented data. `rc-only`: Reverse complement only, using the original ChromBPNet’s reverse complement augmentation data only.`right`: Corrected right-hand side (0/+1) convention. `left`: Corrected left-hand side (-1/0) convention. `both-half`: Both-side (0 and -1/0 and +1) convention, assigning half count to both sides. `both-full`: Both-side (0 and -1/0 and +1) convention, assigning full integer count to both sides. Red: Counts head performance, evaluated by Pearson correlation (higher = better). Blue: Profile head performance, evaluated by 1 - JSD (higher = better). Repeated in ATAC-seq and DNase-seq in the same cell line (K562) and primary cell type (stomach).”)

From the investigation, we could conclude what was happening: the model, (unintentionally) trained on half right-hand side convention (from the original data) and half left-hand side convention (from the reverse complement-augmented data), was predicting an expectation between the two data conventions, which happened to coincide with the both-hand convention.

__Solution__: Moving forward, we have implemented the following fixes and suggestions: 
- DNase-seq cut site convention is now an optional argument (`--dnase-convention`): `right` (for right-hand side), `left` (for left-hand side), `both-half` (for both-side, with half counts each; default), `both-full` (for both-side, with full integer counts each). This allows for all conventions to be possible during training as needed (user should remember which convention was used..!). The default setting is now `both-half` (for reasons explained next). 
- Previously trained ChromBPNet models predict a `both-half`-like convention. (And new, refactored default models will be backwards-compatible). We are currently in the process of updating the training, validation, and test set observed signals, as well as the correct convention-based model performance evaluations. We plan to share another update once this is ready.

## 3. Anthropic’s Claude Fable/Mythos 5.1 optimizations: Fused kernels and faster I/O (mostly faster I/O)

An exciting side-project to this refactoring was hearing about Anthropic’s recent [model release of Fable/Mythos 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) and their case study of optimizing several DNA sequence models–including ChromBPNet. We always welcome any and all improvements to our models from the community, and thought that this refactoring opportunity would be a great chance to deep dive into Fable/Mythos’ suggestions and incorporate them as needed. Anthropic’s optimizations were [released on Sep 17, 2026](https://github.com/anthropics/uplifting-biomolecular-modeling/). 

![Figure: Anthropic Claude Fable/Mythos 5.1 model release.](fable_mythos.png “width=600 Inference speedup for seven open-source protein and genomics models on an NVIDIA H100, as part of Claude Fable/Mythos 5.1 model release.”]

Problem: The goal of Anthropic’s optimizations were focused on developing drop-in optimization kits that speed up the inference pipeline of existing DNA sequence models. This includes preprocessing input data, loading model weights, model inference, any post-processing output data, and final write of the output file. For ChromBPNet, this meant optimizing the prediction pipeline `predict_bw`, that performs a full genome-wide prediction and generates an output BigWig. The optimization kit reported improvements of 1.6x from the original implementation.

Below is a summary of changes applied in the [optimization kit](https://github.com/anthropics/uplifting-biomolecular-modeling/tree/main/chrombpnet) from the model release of Fable/Mythos 5.1:

[Table of changes + wallclock improvements]

While a 1.6x speed up is generally very useful, especially for users, interestingly, it seems like a large fraction of the speed up came from optimizing the write of the BigWig (X%). If allowing for flexible file size, the write of the BigWig could be further optimized by X.Xx (implemented in Section 4.) The fused kernels were compatible only on recent hardware, and only showed speed up on the larger GPUs (H100/H200), with additional minor improvements in numerical accuracy, using fp32-exact kernels (vs. eager TF32 convolutions).

## 4. Additional optimizations in pre- and post-processing

Lastly, we have implemented several additional optimizations in the pre- and post-processing workflows, including vectorized GC-matched non-peaks selections, even faster and more memory-efficient BigWig writing with fixed-step sections, cleaner CLI argument management, random seed for deterministic reproducibility… [add any additional changes and optimizations implemented vs. the original ChromBPNet code base]

[Table of changes + wallclock improvements]

## Reproducibility: Confirming parity with the original ChromBPNet

Given all the changes, we confirmed performance parity with the original [ChromBPNet](https://github.com/kundajelab/chrombpnet/) based on reproducibility on: (1) test set chromosome performance, and (2) model interpretation via DeepLIFT/DeepSHAP contribution scores. 

Reproducibility of model performance is evidently important. Comparing the performance of the models trained on the refactored codebase (using the default `both-half` convention for DNase-seq), across all 3 deep learning engines (PyTorch, TensorFlow, JAX) against the (pretrained) original ChromBPNet model and an original ChromBPNet model retrained on a new seed (as the upper bound): we observe near-perfect reproducibility across all 3 engines, in ATAC-seq and DNase-seq, in cell lines (K562) and primary cells (stomach), on counts/profile head performance, across all 5 chromosome folds. The corrected DNase-seq convention and its test set corrects the true profile head performance. 

![Figure: Refactored ChromBPNet vs. original ChromBPNet: Test set performance.](chrombpnet_refactor_performance.png “width=600 Comparing test set performance of the original ChromBPNet model vs. a retrained original ChromBPNet model and 3 refactored ChromBPNet models on all 3 deep learning engines: PyTorch, TensorFlow, JAX. `original`: The original ChromBPNet model trained as part of ENCODE GRAMMAR. `original (newly trained)`: A newly trained ChromBPNet model using the original codebase. `pytorch`: A refactored ChromBPNet model using PyTorch. `tensorflow`: A refactored ChromBPNet model using TensorFlow. `jax`: A refactored ChromBPNet model using JAX.”)

The robust model interpretation methods have been a key advantange of ChromBPNet, and hence reproducibility of model contribution scores was key. Comparing the DeepLIFT/DeepSHAP contribution scores from each model against the original ChromBPNet’s DeepLIFT/DeepSHAP scores, we observe that contribution scores can be difficult to reproduce perfectly, with only 20 reference sequences (optimized between reproducibility and compute). To quantify the variance in DeepLIFT/DeepSHAP contribution scores, we observed that DeepLIFT/DeepSHAP scores calculated using the same original, pretrained ChromBPNet model, but with simply a different random seed, could achieve a high but not perfect reproducibility (Pearson correlation: 0.86). Further, with a newly trained model, retrained using the same original ChromBPNet codebase, could only reach a reproducibility of 0.72 correlation, setting the upper bound for any reproducibility from a model trained on a changed codebase. Our refactored ChromBPNet codebase reaches this contribution score reproducibility, averaging ~0.71 across the 3 deep learning engines. This confirmed the reproducibility of the refactored ChromBPNet codebase across test performance and contribution scores.

![Figure: Refactored ChromBPNet vs. original ChromBPNet: DeepLIFT/DeepSHAP contribution scores.](chrombpnet_refactor_performance.png “width=600 Comparing reproducibility of the original DeepLIFT/DeepSHAP contribution scores from the original ChromBPNet model vs. a retrained original ChromBPNet model and 3 refactored ChromBPNet models on all 3 deep learning engines: PyTorch, TensorFlow, JAX. Counts hypothetical: DeepLIFT/DeepSHAP score based on the counts head, across all possible bases and positions. Counts projected: DeepLIFT/DeepSHAP score based on the counts head, on the reference genome bases and positions. Profile hypothetical: DeepLIFT/DeepSHAP score based on the profile head, across all possible bases and positions. Profile projected: DeepLIFT/DeepSHAP score based on the profile head, on the reference genome bases and positions. `original`: The original ChromBPNet model trained as part of ENCODE GRAMMAR. `original (newly trained)`: A newly trained ChromBPNet model using the original codebase. `pytorch`: A refactored ChromBPNet model using PyTorch. `tensorflow`: A refactored ChromBPNet model using TensorFlow. `jax`: A refactored ChromBPNet model using JAX.”)

Overall, we share a fully reproducible, refactored version of [ChromBPNet](https://github.com/kundajelab/chrombpnet-refactor/): supporting all 3 major deep learning engines, a corrected DNase-seq cut site convention, several internal and external optimizations–all with confirmed reproducibility in model performance and contributions. 

Moving forward, we recommend using the refactored ChromBPNet codebase for __all future use cases of ChromBPNet__. And we continue to invite any further improvements to the model and codebase!

## References
1. The ENCODE Project Consortium et al. The Encyclopedia of DNA Elements. _bioRxiv_ 2026.07.06.731365 (2026) ([https://doi.org/10.64898/2026.07.06.731365](https://doi.org/10.64898/2026.07.06.731365))
1. Pampari, A. et al. ChromBPNet: bias factorized, base-resolution deep learning models of chromatin accessibility reveal cis-regulatory sequence syntax, transcription factor footprints and regulatory variants. _bioRxiv_ 2024.12.25.630221 (2024). ([https://doi.org/10.1101/2024.12.25.630221](https://doi.org/10.1101/2024.12.25.630221))
1. Shrikumar, A., Greenside, P. & Kundaje, A. Learning Important Features Through Propagating Activation Differences. _arXIV_ (2019).([https://doi.org/10.48550/arXiv.1704.02685](https://doi.org/10.48550/arXiv.1704.02685))
1. Lundberg, S. M. & Lee, S.-I. A unified approach to interpreting model predictions. in _Proceedings of the 31st International Conference on Neural Information Processing Systems_ 4768–4777 (Curran Associates Inc., Red Hook, NY, USA, 2017). ([https://dl.acm.org/doi/10.5555/3295222.3295230](https://dl.acm.org/doi/10.5555/3295222.3295230))
