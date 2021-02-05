import React, { useContext, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import styled, { ThemeContext } from "styled-components";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

import SearchResults from "./ViewBar/ViewStage/SearchResults";
import * as selectors from "../recoil/selectors";
import { useOutsideClick } from "../utils/hooks";

const stringFilterMachine = Machine({
  id: "stringFilter",
  initial: "init",
  context: {
    error: undefined,
    values: [],
    inputValue: "",
    selected: [],
    currentResult: null,
    errorId: null,
    results: [],
    prevValue: "",
  },
  states: {
    init: {},
    reading: {
      on: {
        EDIT: {
          target: "editing",
        },
      },
    },
    editing: {
      entry: [
        assign({
          currentResult: null,
          errorId: null,
          currentResult: null,
        }),
      ],
      type: "parallel",
      states: {
        input: {
          initial: "focused",
          states: {
            focused: {
              on: {
                UNFOCUS_INPUT: "unfocused",
              },
            },
            unfocused: {
              on: {
                FOCUS_INPUT: "focused",
              },
            },
          },
        },
        searchResults: {
          initial: "notHovering",
          states: {
            hovering: {
              on: {
                MOUSELEAVE: "notHovering",
              },
            },
            notHovering: {
              on: {
                MOUSEENTER: "hovering",
              },
            },
          },
        },
      },
      on: {
        NEXT_RESULT: {
          actions: assign({
            currentResult: ({ currentResult, results }) => {
              if (currentResult === null) return 0;
              return Math.min(currentResult + 1, results.length - 1);
            },
            inputValue: ({ currentResult, results }) => {
              if (currentResult === null) return results[0];
              return results[Math.min(currentResult + 1, results.length - 1)];
            },
          }),
        },
        PREVIOUS_RESULT: {
          actions: assign({
            currentResult: ({ currentResult }) => {
              if (currentResult === 0 || currentResult === null) return null;
              return currentResult - 1;
            },
            inputValue: ({ currentResult, prevValue, results }) => {
              if (currentResult === 0 || currentResult === null)
                return prevValue;
              return results[currentResult - 1];
            },
          }),
        },
        BLUR: {
          target: "reading",
        },
        COMMIT: [
          {
            actions: [
              assign({
                selected: ({ selected }, { value }) =>
                  [...new Set([...selected, value])].sort(),
                inputValue: "",
                valid: true,
                results: ({ values }) => values,
              }),
            ],
            cond: ({ values }, { value }) => {
              return values.some((c) => c === value);
            },
          },
          {
            actions: assign({
              error: (_, { value }) => ({
                name: "label",
                error: `${value === "" ? '""' : value} does not exist`,
              }),
              errorId: uuid(),
              valid: false,
            }),
          },
        ],
        CHANGE: {
          actions: [
            assign({
              inputValue: (_, { value }) => value,
              results: ({ values }, { value }) =>
                values.filter((c) =>
                  c.toLowerCase().includes(value.toLowerCase())
                ),
              prevValue: ({ inputValue }) => inputValue,
            }),
          ],
        },
      },
    },
  },
  on: {
    CLEAR: {
      actions: [
        assign({
          selected: [],
        }),
      ],
    },
    REMOVE: {
      actions: [
        assign({
          selected: ({ selected }, { value }) => {
            return selected.filter((s) => s !== value);
          },
        }),
      ],
    },
    SET_VALUES: {
      target: "reading",
      actions: [
        assign({
          values: (_, { values }) => (values ? values : []),
          results: ({ inputValue }, { values }) =>
            values
              ? values.filter((c) =>
                  c.toLowerCase().includes(inputValue.toLowerCase())
                )
              : [],
        }),
      ],
    },
    SET_SELECTED: {
      actions: assign({
        selected: (_, { selected }) => selected,
      }),
    },
    SET_INVERT: {
      actions: assign({
        invert: (_, { invert }) => invert,
      }),
    },
  },
});

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;

  a {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const StringInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.backgroundDark};
  border: 1px solid #191c1f;
  box-shadow: 0 8px 15px 0 rgba(0, 0, 0, 0.43);
  border-radius: 2px;
  font-size: 14px;
  height: 2.5rem;
  font-weight: bold;
  padding: 0.5rem;
  margin-bottom: 0.5rem;

  &:focus {
    outline: none;
  }
`;

const Selected = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0 -0.25rem;
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
`;

const StringButton = styled.button`
    background: ${({ theme }) => theme.background};
    border: 2px solid #393C3F;
    background-color: #2D3034;
    border-radius: 11px;
    text-align: center
    vertical-align: middle;
    margin: 0.5rem 0.25rem 0;
    padding: 0 0.5rem;
    line-height: 20px;
    font-weight: bold;
    cursor: pointer;
    &:focus {
      outline: none;
    }
  `;

const StringFilterContainer = styled.div`
  position: relative;
  margin: 0.25rem 0;
`;

export default React.memo(({ valuesAtom, includeNoneAtom }) => {
  const theme = useContext(ThemeContext);
  const values = useRecoilValue(valuesAtom);
  const [selectedValues, setSelectedValues] = useRecoilState(includeNoneAtom);
  const [state, send] = useMachine(valueFilterMachine);
  const inputRef = useRef();

  useEffect(() => {
    const filtered = selectedValues.filter((c) => values.includes(c));
    filtered.length !== selectedValues.length && setSelectedValues(filtered);
  }, [values, selectedValues]);

  useEffect(() => {
    send({ type: "SET_VALUES", values });
  }, [values]);

  useOutsideClick(inputRef, () => send("BLUR"));
  const { inputValue, results, currentResult, selected } = state.context;

  useEffect(() => {
    if (JSON.stringify(selected) !== JSON.stringify(selectedValues)) {
      send({ type: "SET_SELECTED", selected: selectedValues });
    }
  }, [selectedValues]);

  useEffect(() => {
    if (
      (state.event.type === "COMMIT" && state.context.valid) ||
      state.event.type === "REMOVE" ||
      state.event.type === "CLEAR"
    ) {
      setSelectedValues(state.context.selected);
    }
  }, [state.event]);

  return (
    <>
      <FilterHeader>
        Labels{" "}
        {selected.length ? (
          <a onClick={() => send({ type: "CLEAR" })}>clear {selected.length}</a>
        ) : null}
      </FilterHeader>
      <StringFilterContainer>
        <div ref={inputRef}>
          <StringInput
            value={inputValue}
            placeholder={"+ add label"}
            onFocus={() => state.matches("reading") && send("EDIT")}
            onBlur={() => {
              state.matches("editing.searchResults.notHovering") &&
                send("BLUR");
            }}
            onChange={(e) => send({ type: "CHANGE", value: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                send({ type: "COMMIT", value: e.target.value });
              }
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case "Escape":
                  send("BLUR");
                  break;
                case "ArrowDown":
                  send("NEXT_RESULT");
                  break;
                case "ArrowUp":
                  send("PREVIOUS_RESULT");
                  break;
              }
            }}
          />
          {state.matches("editing") && (
            <SearchResults
              results={results.filter((r) => !selected.includes(r)).sort()}
              send={send}
              currentResult={currentResult}
              style={{
                position: "absolute",
                top: "0.25rem",
                fontSize: 14,
                maxHeight: 294,
                overflowY: "scroll",
              }}
            />
          )}
        </div>
        {selected.length ? (
          <Selected>
            {selected.map((s) => (
              <StringButton
                key={s}
                onClick={() => {
                  send({ type: "REMOVE", value: s });
                }}
              >
                {s + " "}
                <a style={{ color: theme.fontDark }}>x</a>
              </StringButton>
            ))}
          </Selected>
        ) : null}
      </StringFilterContainer>
    </>
  );
});
