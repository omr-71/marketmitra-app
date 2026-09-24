import { At as NoSuchModelError, C as createNullLanguageModelUsage, F as isCustomReasoning, H as loadApiKey, J as postFormDataToApi, M as getTopLevelMediaType, Mt as UnsupportedFunctionalityError, Q as resolveFullMediaType, S as createLanguageModelResponseMetadata, St as object, Tt as union, U as mapReasoningToProviderEffort, V as lazySchema, W as mediaTypeToExtension, Y as postJsonToApi, _ as createBinaryResponseHandler, at as withUserAgentSuffix, b as createJsonErrorResponseHandler, ct as WORKFLOW_DESERIALIZE, h as convertToBase64, k as generateId, l as StreamingToolCallTracker, lt as WORKFLOW_SERIALIZE, m as convertBase64ToUint8Array, mt as boolean, nt as serializeModelOptions, ot as withoutTrailingSlash, p as combineHeaders, pt as array, q as parseProviderOptions, st as zodSchema, ut as _enum, v as createEventSourceResponseHandler, vt as literal, w as createProviderExecutedToolFactory, wt as string, x as createJsonResponseHandler, xt as number } from "./@ai-sdk/gateway+[...].mjs";
//#region node_modules/@ai-sdk/groq/dist/index.js
function convertGroqUsage(usage) {
	var _a, _b, _c, _d, _e, _f;
	if (usage == null) return createNullLanguageModelUsage();
	const promptTokens = (_a = usage.prompt_tokens) != null ? _a : 0;
	const cacheReadTokens = (_c = (_b = usage.prompt_tokens_details) == null ? void 0 : _b.cached_tokens) != null ? _c : void 0;
	const completionTokens = (_d = usage.completion_tokens) != null ? _d : 0;
	const reasoningTokens = (_f = (_e = usage.completion_tokens_details) == null ? void 0 : _e.reasoning_tokens) != null ? _f : void 0;
	const textTokens = reasoningTokens != null ? completionTokens - reasoningTokens : completionTokens;
	return {
		inputTokens: {
			total: promptTokens,
			noCache: cacheReadTokens != null ? promptTokens - cacheReadTokens : promptTokens,
			cacheRead: cacheReadTokens,
			cacheWrite: void 0
		},
		outputTokens: {
			total: completionTokens,
			text: textTokens,
			reasoning: reasoningTokens
		},
		raw: usage
	};
}
function convertToGroqChatMessages(prompt) {
	var _a;
	const messages = [];
	for (const { role, content } of prompt) switch (role) {
		case "system":
			messages.push({
				role: "system",
				content
			});
			break;
		case "user":
			if (content.length === 1 && content[0].type === "text") {
				messages.push({
					role: "user",
					content: content[0].text
				});
				break;
			}
			messages.push({
				role: "user",
				content: content.map((part) => {
					switch (part.type) {
						case "text": return {
							type: "text",
							text: part.text
						};
						case "file": switch (part.data.type) {
							case "reference": throw new UnsupportedFunctionalityError({ functionality: "file parts with provider references" });
							case "text": throw new UnsupportedFunctionalityError({ functionality: "text file parts" });
							case "url":
							case "data":
								if (getTopLevelMediaType(part.mediaType) !== "image") throw new UnsupportedFunctionalityError({ functionality: "Non-image file content parts" });
								return {
									type: "image_url",
									image_url: { url: part.data.type === "url" ? part.data.url.toString() : `data:${resolveFullMediaType({ part })};base64,${convertToBase64(part.data.data)}` }
								};
						}
					}
				})
			});
			break;
		case "assistant": {
			let text = "";
			let reasoning = "";
			const toolCalls = [];
			for (const part of content) switch (part.type) {
				case "reasoning":
					reasoning += part.text;
					break;
				case "text":
					text += part.text;
					break;
				case "tool-call": toolCalls.push({
					id: part.toolCallId,
					type: "function",
					function: {
						name: part.toolName,
						arguments: JSON.stringify(part.input)
					}
				});
			}
			messages.push({
				role: "assistant",
				content: text,
				...reasoning.length > 0 ? { reasoning } : null,
				...toolCalls.length > 0 ? { tool_calls: toolCalls } : null
			});
			break;
		}
		case "tool":
			for (const toolResponse of content) {
				if (toolResponse.type === "tool-approval-response") continue;
				const output = toolResponse.output;
				let contentValue;
				switch (output.type) {
					case "text":
					case "error-text":
						contentValue = output.value;
						break;
					case "execution-denied":
						contentValue = (_a = output.reason) != null ? _a : "Tool call execution denied.";
						break;
					case "content":
					case "json":
					case "error-json": contentValue = JSON.stringify(output.value);
				}
				messages.push({
					role: "tool",
					tool_call_id: toolResponse.toolCallId,
					content: contentValue
				});
			}
			break;
		default: throw new Error(`Unsupported role: ${role}`);
	}
	return messages;
}
var groqLanguageModelChatOptions = object({
	reasoningFormat: _enum([
		"parsed",
		"raw",
		"hidden"
	]).optional(),
	/**
	* Specifies the reasoning effort level for model inference.
	* @see https://console.groq.com/docs/reasoning#reasoning-effort
	*/
	reasoningEffort: _enum([
		"none",
		"default",
		"low",
		"medium",
		"high"
	]).optional(),
	/**
	* Whether to enable parallel function calling during tool use. Default to true.
	*/
	parallelToolCalls: boolean().optional(),
	/**
	* A unique identifier representing your end-user, which can help OpenAI to
	* monitor and detect abuse. Learn more.
	*/
	user: string().optional(),
	/**
	* Whether to use structured outputs.
	*
	* @default true
	*/
	structuredOutputs: boolean().optional(),
	/**
	* Whether to use strict JSON schema validation.
	* When true, the model uses constrained decoding to guarantee schema compliance.
	* Only used when structured outputs are enabled and a schema is provided.
	*
	* @default true
	*/
	strictJsonSchema: boolean().optional(),
	/**
	* Service tier for the request.
	* - 'on_demand': Default tier with consistent performance and fairness
	* - 'performance': Prioritized tier for latency-sensitive workloads
	* - 'flex': Higher throughput tier optimized for workloads that can handle occasional request failures
	* - 'auto': Uses on_demand rate limits, then falls back to flex tier if exceeded
	*
	* @default 'on_demand'
	*/
	serviceTier: _enum([
		"on_demand",
		"performance",
		"flex",
		"auto"
	]).optional()
});
var groqErrorDataSchema = object({ error: object({
	message: string(),
	type: string()
}) });
var groqFailedResponseHandler = createJsonErrorResponseHandler({
	errorSchema: groqErrorDataSchema,
	errorToMessage: (data) => data.error.message
});
var BROWSER_SEARCH_SUPPORTED_MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];
function isBrowserSearchSupportedModel(modelId) {
	return BROWSER_SEARCH_SUPPORTED_MODELS.includes(modelId);
}
function getSupportedModelsString() {
	return BROWSER_SEARCH_SUPPORTED_MODELS.join(", ");
}
function prepareTools({ tools, toolChoice, modelId }) {
	tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
	const toolWarnings = [];
	if (tools == null) return {
		tools: void 0,
		toolChoice: void 0,
		toolWarnings
	};
	const groqTools2 = [];
	for (const tool of tools) if (tool.type === "provider") {
		if (tool.id === "groq.browser_search") {
			if (!isBrowserSearchSupportedModel(modelId)) toolWarnings.push({
				type: "unsupported",
				feature: `provider-defined tool ${tool.id}`,
				details: `Browser search is only supported on the following models: ${getSupportedModelsString()}. Current model: ${modelId}`
			});
			else groqTools2.push({ type: "browser_search" });
		} else toolWarnings.push({
			type: "unsupported",
			feature: `provider-defined tool ${tool.id}`
		});
	} else groqTools2.push({
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: tool.inputSchema,
			...tool.strict != null ? { strict: tool.strict } : {}
		}
	});
	if (toolChoice == null) return {
		tools: groqTools2,
		toolChoice: void 0,
		toolWarnings
	};
	const type = toolChoice.type;
	switch (type) {
		case "auto":
		case "none":
		case "required": return {
			tools: groqTools2,
			toolChoice: type,
			toolWarnings
		};
		case "tool": return {
			tools: groqTools2,
			toolChoice: {
				type: "function",
				function: { name: toolChoice.toolName }
			},
			toolWarnings
		};
		default: throw new UnsupportedFunctionalityError({ functionality: `tool choice type: ${type}` });
	}
}
function mapGroqFinishReason(finishReason) {
	switch (finishReason) {
		case "stop": return "stop";
		case "length": return "length";
		case "content_filter": return "content-filter";
		case "function_call":
		case "tool_calls": return "tool-calls";
		default: return "other";
	}
}
var GroqChatLanguageModel = class _GroqChatLanguageModel {
	constructor(modelId, config) {
		this.specificationVersion = "v4";
		this.supportedUrls = { "image/*": [/^https?:\/\/.*$/] };
		this.modelId = modelId;
		this.config = config;
	}
	static [WORKFLOW_SERIALIZE](model) {
		return serializeModelOptions({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [WORKFLOW_DESERIALIZE](options) {
		return new _GroqChatLanguageModel(options.modelId, options.config);
	}
	get provider() {
		return this.config.provider;
	}
	async getArgs({ prompt, maxOutputTokens, temperature, topP, topK, frequencyPenalty, presencePenalty, stopSequences, responseFormat, seed, reasoning, tools, toolChoice, providerOptions }) {
		var _a, _b, _c, _d;
		const warnings = [];
		const groqOptions = await parseProviderOptions({
			provider: "groq",
			providerOptions,
			schema: groqLanguageModelChatOptions
		});
		const structuredOutputs = (_a = groqOptions == null ? void 0 : groqOptions.structuredOutputs) != null ? _a : true;
		const strictJsonSchema = (_b = groqOptions == null ? void 0 : groqOptions.strictJsonSchema) != null ? _b : true;
		if (topK != null) warnings.push({
			type: "unsupported",
			feature: "topK"
		});
		if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !structuredOutputs) warnings.push({
			type: "unsupported",
			feature: "responseFormat",
			details: "JSON response format schema is only supported with structuredOutputs"
		});
		const { tools: groqTools2, toolChoice: groqToolChoice, toolWarnings } = prepareTools({
			tools,
			toolChoice,
			modelId: this.modelId
		});
		return {
			args: {
				model: this.modelId,
				user: groqOptions == null ? void 0 : groqOptions.user,
				parallel_tool_calls: groqOptions == null ? void 0 : groqOptions.parallelToolCalls,
				max_tokens: maxOutputTokens,
				temperature,
				top_p: topP,
				frequency_penalty: frequencyPenalty,
				presence_penalty: presencePenalty,
				stop: stopSequences,
				seed,
				response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? structuredOutputs && responseFormat.schema != null ? {
					type: "json_schema",
					json_schema: {
						schema: responseFormat.schema,
						strict: strictJsonSchema,
						name: (_c = responseFormat.name) != null ? _c : "response",
						description: responseFormat.description
					}
				} : { type: "json_object" } : void 0,
				reasoning_format: groqOptions == null ? void 0 : groqOptions.reasoningFormat,
				reasoning_effort: (_d = groqOptions == null ? void 0 : groqOptions.reasoningEffort) != null ? _d : isCustomReasoning(reasoning) && reasoning !== "none" ? mapReasoningToProviderEffort({
					reasoning,
					effortMap: {
						minimal: "low",
						low: "low",
						medium: "medium",
						high: "high",
						xhigh: "high"
					},
					warnings
				}) : void 0,
				service_tier: groqOptions == null ? void 0 : groqOptions.serviceTier,
				messages: convertToGroqChatMessages(prompt),
				tools: groqTools2,
				tool_choice: groqToolChoice
			},
			warnings: [...warnings, ...toolWarnings]
		};
	}
	async doGenerate(options) {
		var _a, _b, _c, _d;
		const { args, warnings } = await this.getArgs(options);
		const body = JSON.stringify(args);
		const { responseHeaders, value: response, rawValue: rawResponse } = await postJsonToApi({
			url: this.config.url({
				path: "/chat/completions",
				modelId: this.modelId
			}),
			headers: combineHeaders((_b = (_a = this.config).headers) == null ? void 0 : _b.call(_a), options.headers),
			body: args,
			failedResponseHandler: groqFailedResponseHandler,
			successfulResponseHandler: createJsonResponseHandler(groqChatResponseSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		const choice = response.choices[0];
		const content = [];
		const text = choice.message.content;
		if (text != null && text.length > 0) content.push({
			type: "text",
			text
		});
		const reasoning = choice.message.reasoning;
		if (reasoning != null && reasoning.length > 0) content.push({
			type: "reasoning",
			text: reasoning
		});
		if (choice.message.tool_calls != null) for (const toolCall of choice.message.tool_calls) content.push({
			type: "tool-call",
			toolCallId: (_c = toolCall.id) != null ? _c : generateId(),
			toolName: toolCall.function.name,
			input: toolCall.function.arguments
		});
		return {
			content,
			finishReason: {
				unified: mapGroqFinishReason(choice.finish_reason),
				raw: (_d = choice.finish_reason) != null ? _d : void 0
			},
			usage: convertGroqUsage(response.usage),
			response: {
				...createLanguageModelResponseMetadata(response),
				headers: responseHeaders,
				body: rawResponse
			},
			warnings,
			request: { body }
		};
	}
	async doStream(options) {
		var _a, _b;
		const { args, warnings } = await this.getArgs(options);
		const body = {
			...args,
			stream: true
		};
		const { responseHeaders, value: response } = await postJsonToApi({
			url: this.config.url({
				path: "/chat/completions",
				modelId: this.modelId
			}),
			headers: combineHeaders((_b = (_a = this.config).headers) == null ? void 0 : _b.call(_a), options.headers),
			body,
			failedResponseHandler: groqFailedResponseHandler,
			successfulResponseHandler: createEventSourceResponseHandler(groqChatChunkSchema),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		let toolCallTracker;
		let finishReason = {
			unified: "other",
			raw: void 0
		};
		let usage = void 0;
		let isFirstChunk = true;
		let isActiveText = false;
		let isActiveReasoning = false;
		return {
			stream: response.pipeThrough(new TransformStream({
				start(controller) {
					toolCallTracker = new StreamingToolCallTracker(controller, {
						generateId,
						typeValidation: "required"
					});
					controller.enqueue({
						type: "stream-start",
						warnings
					});
				},
				transform(chunk, controller) {
					var _a2;
					if (options.includeRawChunks) controller.enqueue({
						type: "raw",
						rawValue: chunk.rawValue
					});
					if (!chunk.success) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						controller.enqueue({
							type: "error",
							error: chunk.error
						});
						return;
					}
					const value = chunk.value;
					if ("error" in value) {
						finishReason = {
							unified: "error",
							raw: void 0
						};
						controller.enqueue({
							type: "error",
							error: value.error
						});
						return;
					}
					if (isFirstChunk) {
						isFirstChunk = false;
						controller.enqueue({
							type: "response-metadata",
							...createLanguageModelResponseMetadata(value)
						});
					}
					if (((_a2 = value.x_groq) == null ? void 0 : _a2.usage) != null) usage = value.x_groq.usage;
					const choice = value.choices[0];
					if ((choice == null ? void 0 : choice.finish_reason) != null) finishReason = {
						unified: mapGroqFinishReason(choice.finish_reason),
						raw: choice.finish_reason
					};
					if ((choice == null ? void 0 : choice.delta) == null) return;
					const delta = choice.delta;
					if (delta.reasoning != null && delta.reasoning.length > 0) {
						if (!isActiveReasoning) {
							controller.enqueue({
								type: "reasoning-start",
								id: "reasoning-0"
							});
							isActiveReasoning = true;
						}
						controller.enqueue({
							type: "reasoning-delta",
							id: "reasoning-0",
							delta: delta.reasoning
						});
					}
					if (delta.content != null && delta.content.length > 0) {
						if (isActiveReasoning) {
							controller.enqueue({
								type: "reasoning-end",
								id: "reasoning-0"
							});
							isActiveReasoning = false;
						}
						if (!isActiveText) {
							controller.enqueue({
								type: "text-start",
								id: "txt-0"
							});
							isActiveText = true;
						}
						controller.enqueue({
							type: "text-delta",
							id: "txt-0",
							delta: delta.content
						});
					}
					if (delta.tool_calls != null) {
						if (isActiveReasoning) {
							controller.enqueue({
								type: "reasoning-end",
								id: "reasoning-0"
							});
							isActiveReasoning = false;
						}
						for (const toolCallDelta of delta.tool_calls) toolCallTracker.processDelta(toolCallDelta);
					}
				},
				flush(controller) {
					if (isActiveReasoning) controller.enqueue({
						type: "reasoning-end",
						id: "reasoning-0"
					});
					if (isActiveText) controller.enqueue({
						type: "text-end",
						id: "txt-0"
					});
					toolCallTracker.flush();
					controller.enqueue({
						type: "finish",
						finishReason,
						usage: convertGroqUsage(usage)
					});
				}
			})),
			request: { body: JSON.stringify(body) },
			response: { headers: responseHeaders }
		};
	}
};
var groqChatResponseSchema = object({
	id: string().nullish(),
	created: number().nullish(),
	model: string().nullish(),
	choices: array(object({
		message: object({
			content: string().nullish(),
			reasoning: string().nullish(),
			tool_calls: array(object({
				id: string().nullish(),
				type: literal("function"),
				function: object({
					name: string(),
					arguments: string()
				})
			})).nullish()
		}),
		index: number(),
		finish_reason: string().nullish()
	})),
	usage: object({
		prompt_tokens: number().nullish(),
		completion_tokens: number().nullish(),
		total_tokens: number().nullish(),
		prompt_tokens_details: object({ cached_tokens: number().nullish() }).nullish(),
		completion_tokens_details: object({ reasoning_tokens: number().nullish() }).nullish()
	}).nullish()
});
var groqChatChunkSchema = union([object({
	id: string().nullish(),
	created: number().nullish(),
	model: string().nullish(),
	choices: array(object({
		delta: object({
			content: string().nullish(),
			reasoning: string().nullish(),
			tool_calls: array(object({
				index: number(),
				id: string().nullish(),
				type: literal("function").optional(),
				function: object({
					name: string().nullish(),
					arguments: string().nullish()
				})
			})).nullish()
		}).nullish(),
		finish_reason: string().nullable().optional(),
		index: number()
	})),
	x_groq: object({ usage: object({
		prompt_tokens: number().nullish(),
		completion_tokens: number().nullish(),
		total_tokens: number().nullish(),
		prompt_tokens_details: object({ cached_tokens: number().nullish() }).nullish(),
		completion_tokens_details: object({ reasoning_tokens: number().nullish() }).nullish()
	}).nullish() }).nullish()
}), groqErrorDataSchema]);
var groqTranscriptionModelOptions = lazySchema(() => zodSchema(object({
	language: string().nullish(),
	prompt: string().nullish(),
	responseFormat: string().nullish(),
	temperature: number().min(0).max(1).nullish(),
	timestampGranularities: array(string()).nullish()
})));
var GroqTranscriptionModel = class _GroqTranscriptionModel {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v4";
	}
	get provider() {
		return this.config.provider;
	}
	static [WORKFLOW_SERIALIZE](model) {
		return serializeModelOptions({
			modelId: model.modelId,
			config: model.config
		});
	}
	static [WORKFLOW_DESERIALIZE](options) {
		return new _GroqTranscriptionModel(options.modelId, options.config);
	}
	async getArgs({ audio, mediaType, providerOptions }) {
		var _a, _b, _c, _d, _e;
		const warnings = [];
		const groqOptions = await parseProviderOptions({
			provider: "groq",
			providerOptions,
			schema: groqTranscriptionModelOptions
		});
		const formData = new FormData();
		const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([convertBase64ToUint8Array(audio)]);
		formData.append("model", this.modelId);
		const fileExtension = mediaTypeToExtension(mediaType);
		formData.append("file", new File([blob], "audio", { type: mediaType }), `audio.${fileExtension}`);
		if (groqOptions) {
			const transcriptionModelOptions = {
				language: (_a = groqOptions.language) != null ? _a : void 0,
				prompt: (_b = groqOptions.prompt) != null ? _b : void 0,
				response_format: (_c = groqOptions.responseFormat) != null ? _c : void 0,
				temperature: (_d = groqOptions.temperature) != null ? _d : void 0,
				timestamp_granularities: (_e = groqOptions.timestampGranularities) != null ? _e : void 0
			};
			for (const key in transcriptionModelOptions) {
				const value = transcriptionModelOptions[key];
				if (value !== void 0) {
					if (Array.isArray(value)) for (const item of value) formData.append(`${key}[]`, String(item));
					else formData.append(key, String(value));
				}
			}
		}
		return {
			formData,
			responseFormat: groqOptions == null ? void 0 : groqOptions.responseFormat,
			warnings
		};
	}
	async doGenerate(options) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
		const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
		const { formData, responseFormat, warnings } = await this.getArgs(options);
		const successfulResponseHandler = responseFormat === "text" ? groqTextTranscriptionResponseHandler : createJsonResponseHandler(groqTranscriptionResponseSchema);
		const { value: response, responseHeaders, rawValue: rawResponse } = await postFormDataToApi({
			url: this.config.url({
				path: "/audio/transcriptions",
				modelId: this.modelId
			}),
			headers: combineHeaders((_e = (_d = this.config).headers) == null ? void 0 : _e.call(_d), options.headers),
			formData,
			failedResponseHandler: groqFailedResponseHandler,
			successfulResponseHandler,
			abortSignal: options.abortSignal,
			fetch: this.config.fetch
		});
		return {
			text: response.text,
			segments: (_i = (_h = (_f = response.segments) == null ? void 0 : _f.map((segment) => ({
				text: segment.text,
				startSecond: segment.start,
				endSecond: segment.end
			}))) != null ? _h : (_g = response.words) == null ? void 0 : _g.map((word) => ({
				text: word.word,
				startSecond: word.start,
				endSecond: word.end
			}))) != null ? _i : [],
			language: (_j = response.language) != null ? _j : void 0,
			durationInSeconds: (_k = response.duration) != null ? _k : void 0,
			warnings,
			response: {
				timestamp: currentDate,
				modelId: this.modelId,
				headers: responseHeaders,
				body: rawResponse
			}
		};
	}
};
var groqTranscriptionResponseSchema = object({
	text: string(),
	x_groq: object({ id: string() }),
	task: string().nullish(),
	language: string().nullish(),
	duration: number().nullish(),
	segments: array(object({
		id: number(),
		seek: number(),
		start: number(),
		end: number(),
		text: string(),
		tokens: array(number()),
		temperature: number(),
		avg_logprob: number(),
		compression_ratio: number(),
		no_speech_prob: number()
	})).nullish(),
	words: array(object({
		word: string(),
		start: number(),
		end: number()
	})).nullish()
});
var binaryResponseHandler = createBinaryResponseHandler();
var textDecoder = new TextDecoder();
var groqTextTranscriptionResponseHandler = async (options) => {
	const { value, responseHeaders } = await binaryResponseHandler(options);
	const text = textDecoder.decode(value);
	return {
		value: { text },
		rawValue: text,
		responseHeaders
	};
};
var groqTools = { browserSearch: createProviderExecutedToolFactory({
	id: "groq.browser_search",
	inputSchema: lazySchema(() => zodSchema(object({}))),
	outputSchema: lazySchema(() => zodSchema(object({})))
}) };
var VERSION = "4.0.28";
function createGroq(options = {}) {
	var _a;
	const baseURL = (_a = withoutTrailingSlash(options.baseURL)) != null ? _a : "https://api.groq.com/openai/v1";
	const getHeaders = () => withUserAgentSuffix({
		Authorization: `Bearer ${loadApiKey({
			apiKey: options.apiKey,
			environmentVariableName: "GROQ_API_KEY",
			description: "Groq"
		})}`,
		...options.headers
	}, `ai-sdk/groq/${VERSION}`);
	const createChatModel = (modelId) => new GroqChatLanguageModel(modelId, {
		provider: "groq.chat",
		url: ({ path }) => `${baseURL}${path}`,
		headers: getHeaders,
		fetch: options.fetch
	});
	const createLanguageModel = (modelId) => {
		if (new.target) throw new Error("The Groq model function cannot be called with the new keyword.");
		return createChatModel(modelId);
	};
	const createTranscriptionModel = (modelId) => {
		return new GroqTranscriptionModel(modelId, {
			provider: "groq.transcription",
			url: ({ path }) => `${baseURL}${path}`,
			headers: getHeaders,
			fetch: options.fetch
		});
	};
	const provider = function(modelId) {
		return createLanguageModel(modelId);
	};
	provider.specificationVersion = "v4";
	provider.languageModel = createLanguageModel;
	provider.chat = createChatModel;
	provider.embeddingModel = (modelId) => {
		throw new NoSuchModelError({
			modelId,
			modelType: "embeddingModel"
		});
	};
	provider.textEmbeddingModel = provider.embeddingModel;
	provider.imageModel = (modelId) => {
		throw new NoSuchModelError({
			modelId,
			modelType: "imageModel"
		});
	};
	provider.transcription = createTranscriptionModel;
	provider.transcriptionModel = createTranscriptionModel;
	provider.tools = groqTools;
	return provider;
}
createGroq();
//#endregion
export { createGroq as t };
