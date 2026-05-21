---
post_id: "2026-007"
title: "Benchmarking seq2func models on distal enhancer effects with CRISPRi screens"
image: "crispri_fig1.png"
math: false

authors: ["Alan Murphy","Peter Koo"]

authors_display:
  - name: "Alan Murphy"
    affiliation: "Cold Spring Harbor Labs (CSHL)"
    orcid: "0000-0002-2487-8753"
  - name: "Peter Koo"
    affiliation: "Cold Spring Harbor Labs (CSHL)"
    orcid: "0000-0001-8722-0038"

editor: "TBD"
submitter_github: "Al-Murphy"

tags: ["genomics","crispri","alphagenome","borzoi","enformer","ntv3","seq2func","benchmarking"]
categories: ["Blog Post"]

scope: ["insights"]
audience: ["within-field"]
labs: ["Koo lab"]

status: "submitted"
revision: 1

date_submitted: 2026-05-21
date_accepted:
date: 2026-05-21

doi: ""
revision_history:
  - version: 1
    date: 2026-05-21
    notes: "Initial submission"
---

{{< summary >}}
We benchmark four sequence-to-function genomic deep learning models — [Enformer](https://www.nature.com/articles/s41592-021-01252-x), [Borzoi](https://www.nature.com/articles/s41588-024-02053-6), [NTv3](https://www.biorxiv.org/content/10.64898/2025.12.22.695963v1), and [AlphaGenome](https://www.nature.com/articles/s41586-025-10014-0) — zero-shot on two K562 CRISPRi enhancer-knockdown screens ([Fulco et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31784727/) and [Gasperini et al., 2019](https://pubmed.ncbi.nlm.nih.gov/30612741/)), extending the in-silico CRISPRi setup from [Karollus et al., 2023](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-023-02899-9).

Three things stand out:

* **AlphaGenome leads on both screens** (Pearson r = 0.67 on Fulco, 0.45 on Gasperini), with Borzoi a close second on Fulco and a more distant second on Gasperini.
* **All four models systematically underpredict knockdown magnitude**, and the gap to experimental measurements widens with enhancer-to-TSS distance — distal cis-regulatory element (CRE) effects remain the hardest place to predict.
* **AlphaGenome's RNA-Seq head (with GENCODE-exon aggregation) beats its CAGE head** on the larger screen — how you read the output matters.

**Code**: [seq2func_crispri_eval](https://github.com/Al-Murphy/seq2func_crispri_eval)
{{< /summary >}}

---

## Motivation

Sequence-to-function (seq2func) models keep getting bigger, longer-context, and more capable. [AlphaGenome](https://www.nature.com/articles/s41586-025-10014-0) is the current state of the art, succeeding [Enformer](https://www.nature.com/articles/s41592-021-01252-x) (2021) and [Borzoi](https://www.nature.com/articles/s41588-024-02053-6) (2024). DNA language models like [NTv3](https://www.biorxiv.org/content/10.64898/2025.12.22.695963v1) now compete in the same space.

Headline metrics on held-out reference tracks keep going up. But aggregate performance on the reference genome doesn't tell you how the models do under perturbation — predicting expression changes from sequence changes, which is the actual question for variant interpretation, enhancer design, and CRE prioritisation. [Shen, 2025](https://www.biorxiv.org/content/10.1101/2025.08.05.668750v2.full) recently made this point for natural variation: AlphaGenome improves over Enformer on personal gene expression prediction, but still falls well short on predicting how variants between individuals shift expression. The headline there: AlphaGenome moves the needle, but there's still a long way to go on this kind of distributional shift.

We wanted to probe the same kind of distributional shift from a different angle, through a much larger perturbation, disabling a distal enhancer entirely, and asking whether these models pick up on its effect on the target gene. CRISPRi enhancer screens give us an experimental measurement of exactly that.

> _Side note:_ CRISPRi (CRISPR interference) uses a catalytically dead Cas9 fused to a repressive domain to silence a target locus without cutting DNA. When the target is a distal enhancer, you can read out which genes go down in expression — giving you a measured enhancer → gene effect size.

> _Side note:_ "seq2func" = sequence-to-function. A model that takes raw DNA as input and predicts functional genomic signals (RNA-seq, CAGE, ATAC, ChIP, etc.) as output. Enformer, Borzoi, NTv3, and AlphaGenome are all seq2func models.

This post extends the in-silico CRISPRi benchmark from [Karollus et al., 2023](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-023-02899-9), originally for Enformer and Basenji2, to AlphaGenome, Borzoi, and NTv3.

---

## The benchmark

We test on two K562 CRISPRi enhancer screens:

* **[Fulco et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31784727/)** — ~60 validated enhancer–gene pairs from K562 CRISPRi-FlowFISH. Small but high-confidence.
* **[Gasperini et al., 2019](https://pubmed.ncbi.nlm.nih.gov/30612741/)** — ~440 high-confidence significant pairs from pooled K562 CRISPRi at scale.

For each pair, the procedure is:

1. Build a sequence window of the model's native context (196 kb for Enformer, 524 kb for Borzoi, 1 Mb for NTv3 and AlphaGenome), centred on the gene's TSS.
2. Score the wild-type window.
3. Dinucleotide-shuffle a 2 kb slice covering the enhancer. Repeat N = 50 times, average effect.
4. Aggregate the model output over K562 RNA-Seq tracks in a TSS-centred 640 bp window. For AlphaGenome we additionally use the mean signal across GENCODE exons of the target gene (their paper's preferred RNA-Seq score).
5. Score `pred_delta = (WT − mean(shuffle)) / WT` per pair and correlate with the measured fractional knockdown.

> _Side note_: Why dinucleotide shuffle and not uniform random bases or N-replacement? N-replacement has not been seen by the model during training, so it could lead to some very strange predictions. Drawing random bases changes the local G+C content, biasing the model on composition rather than motif loss. Even a plain base shuffle — which does preserve G+C — destroys dinucleotide frequencies like CpG counts, themselves a learned regulatory signal. Dinucleotide shuffling (Altschul–Erickson) destroys motif content while keeping both single-base and dinucleotide composition intact. The standard for in-silico CRISPRi.

This protocol is a direct extension of [Karollus 2023](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-023-02899-9) — most of it is bit-for-bit faithful to theirs. We reuse their Fulco evaluation tables (`ziga_additional_columns.tsv` + `enhancer_knockdown_effects.tsv` from their [Zenodo release](https://zenodo.org/records/7613255)) with the same merge keys and validated-pair filtering, their TSS / enhancer / strand conventions, the same Enformer DeepMind checkpoint (loaded via the [PyTorch port](https://github.com/lucidrains/enformer-pytorch) rather than TF Hub — same weights, different wrapper), and their K562 CAGE readout, central-bin aggregation, and Pearson/Spearman correlation framework. For Gasperini we apply the same protocol to the Cell 2019 high-confidence pairs (after hg19 → hg38 liftover). The model-specific adjustments — per-architecture aggregation conventions like 5×128 bp bins for Enformer, 20×32 bp for Borzoi, exon-mean for AlphaGenome RNA-Seq — are architecture-driven; the evaluation harness around them is the Karollus harness. Four deliberate departures from Karollus are flagged in [Limitations](#limitations).

---

## Results

**AlphaGenome leads on both screens.** Figure 1 shows predicted vs. measured fractional knockdown for all four models on each screen, with points coloured by enhancer-to-TSS distance.

![Figure 1](crispri_fig1.png "width=900 Figure 1: Predicted vs. measured fractional knockdown for the four models on (a) Fulco 2019 and (b) Gasperini 2019. Points coloured by enhancer-to-TSS distance. AlphaGenome achieves the highest Pearson and Spearman correlations on both screens; Enformer and NTv3 effectively fail on Gasperini. The dashed x = y line marks perfect prediction (predicted = observed); points falling below it indicate the model underestimates the experimental knockdown.")

The headline numbers:

| Model       | Fulco (Pearson / Spearman) | Gasperini (Pearson / Spearman) |
|-------------|---------------------------:|-------------------------------:|
| Enformer    | 0.29 / 0.19                | 0.04 / 0.04                    |
| Borzoi      | 0.66 / 0.52                | 0.30 / 0.27                    |
| NTv3        | 0.24 / 0.00                | 0.04 / 0.12                    |
| AlphaGenome | **0.67 / 0.54**            | **0.45 / 0.45**                |

A few takeaways:

* **AlphaGenome outperforms all other mdoels** on both screens. The margin over Borzoi is small on Fulco but substantial on Gasperini.
* **Enformer and NTv3 fall apart on Gasperini.** Enformer's shorter 196 kb context excludes ~20% of Gasperini pairs, but even on the closer pairs, it manages near-zero correlation. NTv3 has a 1 Mb context, the same as AlphaGenome, and still performs comparably poorly, so context length isn't the explanation.
* **The Gasperini ceiling is low across the board.** Even AlphaGenome leaves the majority of variance unexplained. Some of this is biological noise: Gasperini's pooled design puts multiple sgRNAs per cell, so any single enhancer's effect is measured in an already-perturbed cellular context, with trans effects from the other knockdowns adding noise to the readout. Fulco's CRISPRi-FlowFISH targets one enhancer at a time and is the cleaner ground truth — which may explain part of the per-screen performance gap. Either way, the headline framing is that AlphaGenome improves CRISPRi prediction but a large gap remains, especially for distal cis-regulatory elements (CREs).

### Predictions shrink, knockdowns don't

Figure 2 plots observed and predicted effect against enhancer-to-TSS distance, to more closely match [Karollus et al.'s plotting style](https://link.springer.com/article/10.1186/s13059-023-02899-9/figures/5).

![Figure 2](crispri_fig2.png "width=900 Figure 2: Observed (grey) and predicted (blue) effect (y-axis) vs. enhancer-to-TSS distance (x-axis). Predictions are systematically smaller than observed knockdowns across all four models, and the gap widens at distal distances.")

Two patterns hold across all four models:

* **Predictions are systematically smaller in magnitude than observed knockdowns.** Even where the rank ordering is right (good Spearman), the predicted effect sizes are compressed.
* **The gap grows with distance.** Models capture some of the distance-decay biology, but the slope is shallower than the data demands — most obviously for Enformer and NTv3, less so for AlphaGenome.

### How you read the output matters

A short aside: AlphaGenome's RNA-Seq head, aggregated as the mean signal across the target gene's GENCODE exons (their paper's preferred approach), beats AlphaGenome's CAGE head on Gasperini (Pearson 0.45 vs. 0.39). On Fulco the difference is small (0.67 vs. 0.66). So if you're benchmarking a new model on these screens, your output-aggregation choice should be considered carefully!

![Figure 3](crispri_suppfig2.png "width=900 Figure 3: Predicted vs. measured fractional knockdown for Enformer and AlphaGenome CAGE track and RNA-Seq track on (a) Fulco 2019 and (b) Gasperini 2019. Points coloured by enhancer-to-TSS distance. AlphaGenome's RNA-Seq head with GENCODE-exon aggregation beats its CAGE head on Gasperini and is comparable on Fulco. The dashed x = y line marks perfect prediction (predicted = observed); points falling below it indicate the model underestimates the experimental knockdown.")

### Scoring it two ways

A second aside: we computed the predicted effect two ways. Figure 1 used the linear `pred_delta = (WT − mean(shuffle)) / WT`. We also computed log<sub>2</sub>(WT / mean(shuffle)) against −log<sub>2</sub>(1 − y_delta) — a log fold-change scaling that de-emphasises a few high-end outliers. Figure 4 shows the log<sub>2</sub> version. Spearman is identical between the two scorings (rank-invariant); Pearson shifts a few hundredths but the model ranking is the same.

![Figure 4](crispri_suppfig1.png "width=900 Figure 4: Predicted vs. measured knockdown on the log2 alignment scale (log2(WT / mean(shuffle)) vs. −log2(1 − y_delta)) for Borzoi, NTv3, and AlphaGenome on (a) Fulco 2019 and (b) Gasperini 2019. Enformer omitted. Points coloured by enhancer-to-TSS distance. Model ranking matches Figure 1; Pearson shifts a few hundredths, Spearman is identical. The dashed x = y line marks perfect prediction (predicted = observed); points falling below it indicate the model underestimates the experimental knockdown.")

---

## Limitations

A few things to flag about our analysis.

**Differences from Karollus 2023.** We cross-checked our Enformer reimplementation against Karollus's original code line-by-line with an LLM ([Claude Opus 4.7](https://www.anthropic.com/)). Our Enformer numbers don't exactly match their published ones despite following the same trends. Four deliberate departures from their approach may explain some of this gap:

* **Window construction.** Karollus reads precomputed `sequence_start`/`sequence_end` from a fixed table, designed so both TSS and enhancer sit inside Enformer's central crop. We build the window on-the-fly as strict TSS-centred so that all models were compared equally.
* **No test time augmentations - orientation/offset averaging.** Karollus uses test time augmentations by averages 2 orientations × 3 offsets per sequence (612 forward passes per pair). We run 1 × 1 (51 forward passes with the orientation mnatching the gene of interest). We know shifting and reverse complementing will likely marginally improve performance but for benchmarking, we wanted to test every model on a single pass on the correct orientation of the gene of interest.
* **No N-replacement control.** Karollus also runs an all-N enhancer replacement (replacing every base with the "N" wildcard) as a stronger knockout than shuffling. We deliberately don't: a 2 kb stretch of pure N is out-of-distribution for these models, they may see scattered Ns in gap-adjacent or repeat-masked positions during training, but never contiguous blocks of this size. Predictions there reflect how the model handles unfamiliar input, not how it responds to motif loss, which is the actual question. The dinucleotide shuffle keeps the model in-distribution and isolates the motif-loss signal cleanly.
* **Linear vs. log<sub>2</sub> observed effect.** Karollus uses log<sub>2</sub>(1 + fraction_change); we report the linear fractional change and the log<sub>2</sub> observed effect. Spearman is identical; Pearson differs by a small log-vs-linear distortion.

These won't change model ordering, but absolute Pearson values will move a few hundredths.

**K562 only.** Both screens are in K562, and K562 is heavily represented in every model's training data. None of these numbers say anything about how the models would do on cell types under-represented in training. We'd expect the gap between models, and between predictions and truth, to widen there.

**In-silico ≠ real CRISPRi.** Dinucleotide shuffling destroys motif content but doesn't capture chromatin context changes, dCas9 occupancy, or 3D genome reorganisation. It's a motif-loss proxy, not a full simulation. Karollus discusses this; worth keeping in mind when reading the numbers.

**CRISPRi isn't purely cis.** Knocking down an enhancer can affect other nearby genes, or the target gene's own regulatory partners, whose altered expression shifts the cellular context against which we measure the target. Part of any measured enhancer effect is downstream of these indirect (trans) effects, which a sequence-only model predicting from a TSS-centred window can't capture.

---

## Implications

The benchmark gives a clean, model-agnostic test for any new seq2func model on a biologically meaningful task. AlphaGenome's gains over Enformer and Borzoi are real, and most pronounced on the larger, harder Gasperini screen. But even the best model still leaves the majority of variance unexplained and underestimates the magnitude of distal-enhancer effects — which matters for downstream applications like CRE prioritisation and enhancer design.

Echoing [Shen 2025](https://www.biorxiv.org/content/10.1101/2025.08.05.668750v2.full) from a different angle: AlphaGenome moves the needle, but there's still a long way to go.

The repo is set up so adding a fifth model is one new `scripts/test_<dataset>_<newmodel>.py` writing a CSV with `y_delta` and `pred_delta` columns. If you've got a model you want to test, we'd love to see it!

---

## Code and links

* [Source code & evaluation scripts](https://github.com/Al-Murphy/seq2func_crispri_eval)
* [Karollus et al., 2023 — the benchmark this extends](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-023-02899-9)
* [SequenceModelBenchmark Zenodo (Karollus tables)](https://zenodo.org/records/8275436)
* Models: [Enformer (PyTorch)](https://github.com/lucidrains/enformer-pytorch) · [Borzoi](https://github.com/calico/borzoi) · [Flashzoi](https://huggingface.co/johahi) · [NTv3](https://huggingface.co/InstaDeepAI/NTv3_650M_post) · [AlphaGenome PyTorch port](https://github.com/genomicsxai/alphagenome-pytorch)

---

## TL;DR

* We benchmark **Enformer, Borzoi, NTv3, and AlphaGenome** zero-shot on two K562 CRISPRi enhancer screens (Fulco 2019, Gasperini 2019), extending [Karollus et al., 2023](https://genomebiology.biomedcentral.com/articles/10.1186/s13059-023-02899-9).
* **AlphaGenome leads** — Pearson 0.67 on Fulco, 0.45 on Gasperini. Borzoi is a close second on Fulco, a distant second on Gasperini. Enformer and NTv3 fail on Gasperini.
* **All four models systematically underpredict knockdown magnitude**, and the gap widens with enhancer–TSS distance.
* **AlphaGenome's RNA-Seq exon-aggregation head outperforms its CAGE head** on Gasperini — output aggregation matters.
* **Limitations**: K562 only, in-silico shuffle as a motif-loss proxy, indirect trans effects in real CRISPRi that no sequence-only model can capture, small differences from Karollus's original implementation.

AlphaGenome improves CRISPRi effect prediction. The remaining gap, especially for distal CREs, is still an open problem for the field.

---

## References

1. Avsec, Ž. et al. Effective gene expression prediction from sequence by integrating long-range interactions. _Nature Methods_, 18, 1196–1203 (2021).
2. Linder, J. et al. Predicting RNA-seq coverage from DNA sequence as a unifying model of gene regulation. _Nature Genetics_, 56, 2532–2543 (2024).
3. Boshar, S. et al. A foundational model for joint sequence-function multi-species modeling at scale for long-range genomic prediction. _bioRxiv_ (2025). https://doi.org/10.64898/2025.12.22.695963
4. Avsec, Ž. et al. Advancing regulatory variant effect prediction with AlphaGenome. _Nature_ (2025). https://doi.org/10.1038/s41586-025-10014-0
5. Karollus, A., Hingorani, N., Gagneur, J. Current sequence-to-expression models do not faithfully reflect cis-regulatory effects. _Genome Biology_, 24, 56 (2023).
6. Fulco, C. P. et al. Activity-by-contact model of enhancer–promoter regulation from thousands of CRISPR perturbations. _Nature Genetics_, 51, 1664–1669 (2019).
7. Gasperini, M. et al. A genome-wide framework for mapping gene regulation via cellular genetic screens. _Cell_, 176, 377–390.e19 (2019).
8. Shen, L. AlphaGenome enhances personal gene expression prediction but retains key limitations. _bioRxiv_ (2025). https://doi.org/10.1101/2025.08.05.668750