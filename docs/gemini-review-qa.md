# Gemini review QA — 2026-09-05

Reviewed exports `review_case_3_device_agg_vitrina (12).md` and `(13).md`
are byte-identical: one result, not two independent model runs. The report
contains 20 findings (18 LLM, 2 rule), with 4 blocker, 13 major and 3 minor
findings; template coverage is 9/21. Model: `gemini-2.5-flash`, elapsed 34.1 s.
Comparison source: `examples/case_3_device_agg_vitrina.md`.

## Useful findings

Missing Data Catalog links (#5), field nullability (#6), DDL (#3), unspecified
join types and unmatched-record handling (#9–10), an unclear deduplication
tie-breaker (#11), and the empty final write step (#13) warrant clarification.
Their existence does not automatically justify each assigned severity.

## Prompt review for the AI/Product owner

| Finding | Observed problem | Desired behavior |
| --- | --- | --- |
| #16 | Asks for Kafka/HDFS locations although sources are described as tables. | Establish the storage/transport technology before applying technology-specific requirements. |
| #17 | Treats `CLUSTER` as a definite author omission. | Account for anonymization in organizer examples; ask about deployment details only when applicable. Do not hardcode this literal as a global exemption. |
| #14 | Treats incremental loading and full replacement of a month as necessarily contradictory. | Ask how extraction and target-period replacement relate; do not assume incremental loading requires upsert. |
| #1–2 | Treats missing serialization details as definitely blocking without clarifying the table access/storage interface. | Apply the official serialization criterion in the context of the actual interface, distinguishing database schema from serialization schema. |
| #20 | Says dictionary origins are missing although schema/table references are listed. | Distinguish existing object references from missing refresh frequency or ownership details. |
| #1, #5, #16, #20 | Combines multiple table rows into one quote. | Quote a single relevant source fragment, as already required by the prompt. |

## Backend correction

Finding #13 correctly identifies an empty write step but has no quote.
The pipeline now restores the original heading line only when the finding
claims an empty section, identifies exactly one parsed heading, and that
section and its descendants contain no body text. It supports the section
markers supplied in the LLM prompt. Existing quotes are preserved; ambiguous
locations and populated sections are not assigned substitute evidence.

This is a narrow missing-quote correction, not full verification of all LLM
claims or quotes. It does not remove questionable findings or change prompts,
severity, or model summaries. Automated tests use a mocked LLM response.

The user's subsequent live Gemini exports `(15).md` and `(16).md` are
byte-identical and contain 20 findings (5 blocker, 13 major, 2 minor).
Finding #17 now includes the actual heading `### Шаг 5. Запись в CDM`,
confirming the expected exported result after restarting the local app.
The exports alone do not distinguish a model-supplied quote from a restored
one; automated tests separately verify the missing-quote restoration path.
Remaining issues in that run include duplicate nullability findings (#4/#7),
a missing-timezone claim (#8) despite the document's general UTC setting,
and the anonymized cluster-name complaint (#18).

## Final verification

After prompt revisions, compare a new review against this source. Check
whether the useful findings remain, technology assumptions disappear, and
every finding has a relevant source quote. Test a second, unseen document
before claiming that the improvements generalize. Finding count alone is
not a quality metric.
